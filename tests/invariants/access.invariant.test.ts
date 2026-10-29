import { test } from "node:test";
import assert from "node:assert/strict";
import { publicHarness, publicRequest } from "../helpers/public-promptpro.ts";
import { IP_WINDOW_MS } from "../../src/promptpro/ip-limit.ts";
import { quotaStores } from "../helpers/quota-store.ts";
import { config } from "../../src/promptpro/functions/generate.ts";

test("INV-003: public generation needs no class code, but requires a trusted client IP", async () => {
  const h = publicHarness();
  for (const ip of [undefined, "", "unknown", "192.0.2.1, 192.0.2.2"]) {
    const req = publicRequest();
    req.headers.set("x-forwarded-for", "192.0.2.10");
    req.headers.set("x-nf-client-connection-ip", "192.0.2.10");
    assert.equal((await h.app(req, ip)).status, 503);
    assert.equal(h.calls.length, 0); assert.equal(h.factories(), 0);
  }
  assert.equal((await h.app(publicRequest(), "192.0.2.1")).status, 200);
  assert.equal(h.calls.length, 1);
});
test("INV-003: ten attempts per IP per hour; refusal happens before the model", async () => {
  let time = 0;
  const h = publicHarness({ now: () => time });
  for (let i = 0; i < 10; i++) assert.equal((await h.app(publicRequest(), "192.0.2.1")).status, 200);
  const blocked = await h.app(publicRequest(), "192.0.2.1");
  assert.equal(blocked.status, 429); assert.equal(blocked.headers.get("retry-after"), "3600");
  assert.equal(h.calls.length, 10); assert.equal(h.factories(), 10);
  assert.equal((await h.app(publicRequest(), "192.0.2.2")).status, 200);
  time = IP_WINDOW_MS - 1;
  assert.equal((await h.app(publicRequest(), "192.0.2.1")).status, 429);
  time = IP_WINDOW_MS;
  assert.equal((await h.app(publicRequest(), "192.0.2.1")).status, 200);
  assert.equal(h.calls.length, 12);
});
test("INV-003 catches bypassed quotas: concurrent and failed attempts cannot exceed ten completions", async () => {
  const store = quotaStores();
  const left = publicHarness({ fail: true, store: store.client });
  const right = publicHarness({ fail: true, store: store.client });
  const responses = await Promise.all(Array.from({ length: 11 }, (_, i) => (i % 2 ? left : right).app(publicRequest(), "192.0.2.1")));
  assert.equal(responses.filter((r) => r.status === 502).length, 10);
  assert.equal(responses.filter((r) => r.status === 429).length, 1);
  assert.equal(left.calls.length + right.calls.length, 10);
  assert.equal(left.factories() + right.factories(), 10);
  const restarted = publicHarness({ store: store.client });
  assert.equal((await restarted.app(publicRequest(), "192.0.2.1")).status, 429);
  assert.equal(restarted.factories(), 0);
  assert.equal(config.path, "/api/generate");
  assert.deepEqual(config.rateLimit, { windowLimit: 60, windowSize: 60, aggregateBy: ["domain", "ip"] });
});
