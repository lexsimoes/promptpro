import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { harness, request, payload, CLASSES } from "../helpers/promptpro.ts";
const KEY = "sk-test-123"; // Fabricated sentinel, never a real credential.

test("INV-004: built browser assets contain neither the server key nor class codes", () => {
  execFileSync("npm", ["run", "build:promptpro"], { stdio: "pipe", env: { ...process.env, LLM_API_KEY: KEY, CLASS_CODES_JSON: JSON.stringify(CLASSES) } });
  for (const name of readdirSync("dist-promptpro", { recursive: true, encoding: "utf8" })) {
    if (!/\.(html|js|css)$/.test(name)) continue;
    const content = readFileSync(join("dist-promptpro", name), "utf8");
    for (const secret of [KEY, ...CLASSES.map((c) => c.code), "turma-e2e", "turma-vencida", "turma-e2e-limite"]) assert.ok(!content.includes(secret), `secret in ${name}`);
  }
});
test("INV-004 catches raw provider errors: no key or class list in success/error responses", async () => {
  const h = harness({ limit: 1 });
  const responses = [await h.app(request(payload())), await h.app(request(payload())),
    await h.app(request({ ...payload(), idea: "" })), await h.app(request({ idea: "x" })),
    await h.app(request({ ...payload(), code: "unknown" }))];
  for (const fail of [`invalid key ${KEY}`, `the provider answered HTTP 402: ${KEY}`]) {
    responses.push(await harness({ fail }).app(request(payload())));
  }
  assert.deepEqual(responses.map((r) => r.status), [200, 429, 400, 401, 403, 502, 402]);
  for (const response of responses) {
    const text = await response.text();
    for (const secret of [KEY, ...CLASSES.map((c) => c.code), JSON.stringify(CLASSES)]) assert.ok(!text.includes(secret));
  }
});
