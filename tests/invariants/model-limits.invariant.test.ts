import { test } from "node:test";
import assert from "node:assert/strict";
import { harness, request, payload, VALID } from "../helpers/promptpro.ts";

test("INV-006: 2000 characters reach the model, 2001/blank/invalid input never does", async () => {
  const h = harness();
  assert.equal((await h.app(request(payload("x".repeat(2000))))).status, 200);
  for (const idea of ["x".repeat(2001), "", "  "]) assert.equal((await h.app(request(payload(idea)))).status, 400);
  assert.equal((await h.app(request({ ...payload(), projectStatus: "maybe" }))).status, 400);
  assert.equal((await h.app(request({ ...payload(), idea: 12 }))).status, 400);
  assert.equal(h.calls.length, 1);
});
test("INV-006 catches a dropped cap: every completion explicitly requests at most 1500 tokens", async () => {
  const h = harness();
  await h.app(request(payload())); await h.app(request({ ...payload(), projectStatus: "existing" }));
  assert.equal(h.calls.length, 2);
  for (const call of h.calls) assert.ok(typeof call.maxTokens === "number" && call.maxTokens > 0 && call.maxTokens <= 1500);
  for (const text of ["invalid output", VALID + "x".repeat(12000)]) {
    const invalid = harness({ text }); assert.equal((await invalid.app(request(payload()))).status, 502);
  }
});
