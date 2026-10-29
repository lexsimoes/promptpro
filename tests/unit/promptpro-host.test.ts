import { test } from "node:test";
import assert from "node:assert/strict";
import { hostGate } from "../../src/promptpro/edge/host.ts";

test("edge host gate rejects old hosts even for HTML/assets without invoking downstream", async () => {
  let calls = 0; const next = async () => { calls++; return new Response("page"); };
  for (const path of ["/", "/assets/app.js", "/api/generate"]) {
    assert.equal((await hostGate(new Request("https://old.netlify.app" + path), next, "production", "old.netlify.app")).status,403);
  }
  assert.equal(calls,0);
  const valid = await hostGate(new Request("https://getprompt.pro/"), next,"production");
  assert.equal(valid.status,200); assert.equal(await valid.text(),"page");
  assert.match(valid.headers.get("content-security-policy")!,/frame-ancestors 'none'/); assert.equal(valid.headers.get("cache-control"),"no-store");
});
test("edge preview host is exact and explicit, missing configuration or upstream failures are closed", async () => {
  const url="https://deploy-preview-7--example.netlify.app/", req=()=>new Request(url), next=async()=>new Response("page");
  assert.equal((await hostGate(req(),next,"preview","deploy-preview-7--example.netlify.app")).status,200);
  assert.equal((await hostGate(req(),next,"preview","deploy-preview-8--example.netlify.app")).status,403);
  assert.equal((await hostGate(req(),next,"preview")).status,503);
  assert.equal((await hostGate(req(),next)).status,503);
  assert.equal((await hostGate(new Request("https://getprompt.pro/"),async()=>{throw new Error("private upstream error");},"production")).status,503);
});
