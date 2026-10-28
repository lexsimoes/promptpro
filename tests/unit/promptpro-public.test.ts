import { test } from "node:test";
import assert from "node:assert/strict";
import { createIpLimiter } from "../../src/promptpro/ip-limit.ts";
import { createRuntime } from "../../src/promptpro/runtime.ts";
import { publicHarness, publicRequest } from "../helpers/public-promptpro.ts";
import { request } from "../helpers/promptpro.ts";

test("IP keys normalize IPv6 spellings and IPv4-mapped loopback", () => {
  const take = createIpLimiter();
  for (let i = 0; i < 10; i++) assert.equal(take(i % 2 ? "2001:db8::1" : "2001:0db8:0:0:0:0:0:1").status, 200);
  assert.equal(take("2001:DB8::1").status, 429);
  for (let i = 0; i < 10; i++) assert.equal(take(i % 2 ? "127.0.0.1" : "::ffff:127.0.0.1").status, 200);
  assert.equal(take("127.0.0.1").status, 429);
  assert.equal(take("::FFFF:7f00:1").status, 429);
  assert.equal(take("fe80::1%eth0").status, 503);
});
test("IP quota memory is bounded without evicting active users; expired buckets are reclaimed", () => {
  let now = 0;
  const take = createIpLimiter(() => now);
  for (let i = 0; i < 10000; i++) assert.equal(take(`10.0.${Math.floor(i / 256)}.${i % 256}`).status, 200);
  assert.equal(take("192.0.2.1").status, 503);
  assert.equal(take("10.0.0.0").status, 200);
  now = 3600000;
  assert.equal(take("192.0.2.1").status, 200);
});
test("invalid input and access probes do not consume the application's generation quota", async () => {
  const h = publicHarness();
  for (let i = 0; i < 11; i++) {
    assert.equal((await h.app(request({}, "/api/access"))).status, 200);
    assert.equal((await h.app(request({ idea: " " }), "192.0.2.1")).status, 400);
  }
  for (let i = 0; i < 10; i++) assert.equal((await h.app(publicRequest(), "192.0.2.1")).status, 200);
  assert.equal((await h.app(publicRequest(), "192.0.2.1")).status, 429);
  assert.equal(h.calls.length, 10);
});
test("public preview runtime needs no CLASS_CODES_JSON and fails closed without a platform IP", async () => {
  const app = createRuntime({ APP_ENV: "preview", PREVIEW_HOST: "deploy-preview-8--example.netlify.app", LLM_PROVIDER: "openai-compatible", LLM_MODEL: "deepseek-flash", LLM_BASE_URL: "https://api.deepseek.com" });
  const origin = "https://deploy-preview-8--example.netlify.app";
  assert.equal((await app(request({}, "/api/access", origin))).status, 200);
  assert.equal((await app(request({ idea: "Quero um site." }, "/api/generate", origin))).status, 503);
});
test("isolated public mock opens without a class link and enforces the same quota", async () => {
  const app = createRuntime({ APP_ENV: "e2e", LLM_PROVIDER: "mock" });
  const req = () => request({ idea: "Quero um site." }, "/api/generate", "http://127.0.0.1");
  for (let i = 0; i < 10; i++) assert.equal((await app(req())).status, 200);
  assert.equal((await app(req())).status, 429);
});
