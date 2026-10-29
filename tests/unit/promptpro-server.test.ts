import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { providerFor, createRuntime } from "../../src/promptpro/runtime.ts";
import { parseCodes, E2E_CODES } from "../../src/promptpro/access.ts";
import { startServer } from "../../src/promptpro/server.ts";
import { createHandler } from "../../src/promptpro/handler.ts";
import { harness, payload, request } from "../helpers/promptpro.ts";

test("promptPRO e2e refuses every real provider, production refuses mock or arbitrary upstream", () => {
  assert.equal(providerFor({ APP_ENV: "e2e", LLM_PROVIDER: "mock" }), "mock");
  for (const provider of ["openai-compatible", "anthropic", undefined]) assert.throws(() => providerFor({ APP_ENV: "e2e", LLM_PROVIDER: provider }));
  assert.throws(() => providerFor({ APP_ENV: "production", LLM_PROVIDER: "mock" }));
  assert.throws(() => providerFor({ APP_ENV: "production", LLM_PROVIDER: "openai-compatible", LLM_MODEL: "deepseek-flash", LLM_BASE_URL: "https://evil.invalid" }));
  for (const value of [undefined, "null", "[]", JSON.stringify([{ code: "x", expiresAt: "no", limit: 1, active: true }])]) assert.throws(() => parseCodes(value));
});
test("e2e codes, version markers, original idea and optional project status are deterministic", async () => {
  const app = createRuntime({ APP_ENV: "e2e", LLM_PROVIDER: "mock" });
  const send = (idea: string, extra = {}) => app(new Request("http://127.0.0.1/api/generate", { method: "POST", headers: { origin: "http://127.0.0.1", "content-type": "application/json" }, body: JSON.stringify({ code: "turma-e2e", idea, ...extra }) }));
  const idea = "Quero um site para a minha pista de kart em Campinas.";
  const first = await (await send(idea, { projectStatus: "existing" })).json() as { prompt: string };
  const second = await (await send(idea)).json() as { prompt: string };
  assert.ok(first.prompt.includes(idea.slice(0,40))); assert.match(first.prompt, /Projeto existente\./); assert.match(first.prompt, /Versão 1/);
  assert.match(second.prompt, /Versão 2/); assert.ok(!second.prompt.includes("Projeto existente."));
  assert.equal((await send("E2E-FALHA-PROVEDOR")).status, 502);
  assert.equal(E2E_CODES.find((c) => c.code === "turma-e2e-limite")!.limit, 1);
});
test("canonical host, exact preview exception, Origin, methods and bodies fail closed", async () => {
  const h = harness();
  assert.equal((await h.app(request(payload(), "/api/generate", "https://old.netlify.app"))).status, 403);
  const foreign = request(payload()); foreign.headers.set("origin", "https://evil.invalid"); assert.equal((await h.app(foreign)).status,403);
  const spoof = request(payload()); spoof.headers.set("host", "old.netlify.app"); assert.equal((await h.app(spoof)).status,403);
  assert.equal((await h.app(new Request("https://getprompt.pro/api/generate"))).status,405);
  const preview = createHandler({ classes: E2E_CODES, previewHost: "deploy-preview-7--example.netlify.app", client: () => { throw new Error("must not call"); } });
  assert.equal((await preview(new Request("https://deploy-preview-7--example.netlify.app/api/access", { method: "POST", headers: { origin:"https://deploy-preview-7--example.netlify.app", "content-type":"application/json" }, body:'{"code":"turma-e2e"}' }))).status,200);
  const invalid = new Request("https://getprompt.pro/api/generate", { method:"POST", headers:{ origin:"https://getprompt.pro", "content-type":"application/json" }, body:"{" });
  assert.equal((await h.app(invalid)).status,400);
  assert.equal((await h.app(request({ ...payload(), extra:true }))).status,400);
  assert.equal(h.calls.length,0);
});
test("concurrent requests reserve class attempts before the model; failures also consume attempts", async () => {
  const h = harness({ limit:1, fail:"provider down" });
  const responses = await Promise.all([h.app(request(payload())), h.app(request(payload()))]);
  assert.deepEqual(responses.map((r) => r.status),[502,429]); assert.equal(h.calls.length,1);
});
test("local Node adapter shares API and refuses real providers before it listens", async () => {
  const saved = { APP_ENV:process.env.APP_ENV, LLM_PROVIDER:process.env.LLM_PROVIDER };
  process.env.APP_ENV="e2e"; process.env.LLM_PROVIDER="openai-compatible";
  assert.throws(() => startServer(0));
  process.env.LLM_PROVIDER="mock";
  const server=startServer(0);
  try {
    await once(server,"listening"); const address=server.address(); assert.ok(address && typeof address==="object");
    const origin=`http://127.0.0.1:${address.port}`;
    const response=await fetch(origin+"/api/generate",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify({code:"turma-e2e",idea:"Quero um site."})});
    assert.equal(response.status,200); assert.match(response.headers.get("content-security-policy")!,/frame-ancestors 'none'/);
  } finally {
    await new Promise<void>((resolve,reject)=>server.close((error)=>error?reject(error):resolve()));
    for (const [key,value] of Object.entries(saved)) { if(value===undefined) delete process.env[key]; else process.env[key]=value; }
  }
});

test("preview host requires explicit runtime preview mode; production ignores the exception", async () => {
  const settings = { LLM_PROVIDER: "openai-compatible", LLM_MODEL: "deepseek-flash", LLM_BASE_URL: "https://api.deepseek.com", CLASS_CODES_JSON: JSON.stringify(E2E_CODES), PREVIEW_HOST: "deploy-preview-7--example.netlify.app" };
  const req = () => new Request("https://deploy-preview-7--example.netlify.app/api/access", { method:"POST", headers:{ origin:"https://deploy-preview-7--example.netlify.app", "content-type":"application/json" }, body:'{"code":"turma-e2e"}' });
  assert.equal((await createRuntime({ ...settings, APP_ENV:"preview" })(req())).status,200);
  assert.equal((await createRuntime({ ...settings, APP_ENV:"production" })(req())).status,403);
});
