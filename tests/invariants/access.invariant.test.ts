import { test } from "node:test";
import assert from "node:assert/strict";
import { harness, request, payload, CLASSES } from "../helpers/promptpro.ts";

test("INV-003: missing/unknown/expired/case-or-space-altered codes never reach the model", async () => {
  const h = harness();
  for (const [code, status] of [[undefined, 401], ["turma-x", 403], [CLASSES[0]!.code.toUpperCase(), 403], [` ${CLASSES[0]!.code} `, 403]] as const) {
    assert.equal((await h.app(request({ ...payload(), code }))).status, status);
    assert.equal(h.calls.length, 0); assert.equal(h.factories(), 0);
  }
  const expired = harness({ now: () => Date.parse("2027-01-01T00:00:00-03:00") });
  assert.equal((await expired.app(request(payload()))).status, 403);
  assert.equal(expired.calls.length, 0); assert.equal(expired.factories(), 0);
});
test("INV-003: an unexpired code works just before expiry, midnight does not", async () => {
  let time = Date.parse("2026-12-31T23:59:58-03:00");
  const h = harness({ now: () => time });
  assert.equal((await h.app(request(payload()))).status, 200); assert.equal(h.calls.length, 1);
  time = Date.parse("2027-01-01T00:00:00-03:00");
  assert.equal((await h.app(request(payload()))).status, 403); assert.equal(h.calls.length, 1);
});
test("INV-003 catches bypassed authorization: denied requests have zero completions", async () => {
  const h = harness();
  await h.app(request({ ...payload(), code: "revoked" }));
  assert.equal(h.calls.length, 0); assert.equal(h.factories(), 0);
  const inactive = harness({ classes: CLASSES.map((c) => ({ ...c, active: false })) });
  assert.equal((await inactive.app(request(payload()))).status, 403); assert.equal(inactive.calls.length, 0);
});
