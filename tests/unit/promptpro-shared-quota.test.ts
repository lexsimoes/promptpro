import { test } from "node:test";
import assert from "node:assert/strict";
import { createSharedIpLimiter } from "../../src/promptpro/shared-quota.ts";
import type { QuotaStore } from "../../src/promptpro/shared-quota.ts";
import { quotaNamespace } from "../../src/promptpro/runtime.ts";
import { quotaStores } from "../helpers/quota-store.ts";
import { publicHarness, publicRequest } from "../helpers/public-promptpro.ts";

test("shared quotas survive independent clients and restarts, renew only after one hour, and store no raw IP", async () => {
  let time = 0;
  const mock = quotaStores();
  const first = createSharedIpLimiter(mock.client, () => time);
  for (let i = 0; i < 10; i++) assert.equal((await first(i % 2 ? "2001:0db8::1" : "2001:db8::1")).status, 200);
  const restarted = createSharedIpLimiter(mock.client, () => time);
  assert.equal((await restarted("2001:db8::1")).status, 429);
  time = 3599999;
  assert.equal((await restarted("2001:db8::1")).status, 429);
  time = 3600000;
  assert.equal((await restarted("2001:db8::1")).status, 200);
  assert.equal((await restarted("192.0.2.2")).status, 200);
  const snapshot = JSON.stringify([...mock.records]);
  assert.ok(!snapshot.includes("2001:") && !snapshot.includes("192.0.2.2"));
  for (const row of mock.records.values()) {
    const data: unknown = JSON.parse(row.text);
    if (typeof data !== "string") assert.deepEqual(Object.keys(data as object).sort(), ["expires", "used"]);
  }
});
test("storage failures, corrupt data, absent ETags and persistent conflicts fail before model construction", async () => {
  const unavailable = async () => { throw new Error("synthetic SDK fault"); };
  const seeds: QuotaStore[] = [
    { getWithMetadata: unavailable, setJSON: unavailable },
    { getWithMetadata: async () => ({ data: "corrupt" }), setJSON: unavailable },
    { getWithMetadata: async (key) => key === "_salt" ? { data: "a".repeat(64) } : { data: { used: 1, expires: 3600000 } }, setJSON: unavailable },
    { getWithMetadata: async (key) => key === "_salt" ? { data: "a".repeat(64) } : null, setJSON: async () => ({ modified: false }) },
  ];
  for (const store of seeds) {
    const h = publicHarness({ store: () => store, now: () => 0 });
    const res = await h.app(publicRequest(), "192.0.2.1");
    assert.equal(res.status, 503); assert.equal(h.factories(), 0);
    assert.ok(!(await res.text()).includes("SDK"));
  }
});
test("SDK conditional writes reject stale ETags instead of losing another instance's reservation", async () => {
  const mock = quotaStores(), a = mock.client(), b = mock.client();
  await a.setJSON("key", { used: 1 }, { onlyIfNew: true });
  const stale = await a.getWithMetadata("key", { type: "json", consistency: "strong" });
  assert.ok(stale?.etag);
  assert.equal((await b.setJSON("key", { used: 2 }, { onlyIfMatch: stale.etag })).modified, true);
  assert.equal((await a.setJSON("key", { used: 2 }, { onlyIfMatch: stale.etag })).modified, false);
  assert.equal((await a.getWithMetadata("key", { type: "json", consistency: "strong" }))?.data.used, 2);
});
test("production and each Preview have stable separate namespaces", () => {
  const prod = quotaNamespace("production");
  const a = quotaNamespace("preview", "deploy-preview-8--example.netlify.app");
  const b = quotaNamespace("preview", "deploy-preview-7--example.netlify.app");
  assert.notEqual(prod, a); assert.notEqual(a, b);
  assert.equal(a, quotaNamespace("preview", "deploy-preview-8--example.netlify.app"));
  assert.throws(() => quotaNamespace("disabled"));
});
