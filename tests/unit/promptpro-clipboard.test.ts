import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { setImmediate } from "node:timers/promises";
import ts from "typescript";

type FakeNode = { value: string; textContent: string; focused: boolean; selected: boolean; setAttribute: () => void; addEventListener: (name: string, fn: () => void) => void; focus: () => void; select: () => void };
async function clickCopy(clipboard?: { writeText: (text: string) => Promise<void> }) {
  const nodes = new Map<string, FakeNode>(), handlers = new Map<string, () => void>();
  function node(id: string): FakeNode {
    let n = nodes.get(id);
    if (!n) {
      n = { value: "", textContent: "", focused: false, selected: false, setAttribute() {}, addEventListener(name, fn) { handlers.set(`${id}:${name}`, fn); }, focus() { this.focused = true; }, select() { this.selected = true; } };
      nodes.set(id, n);
    }
    return n;
  }
  const code = ts.transpileModule(readFileSync("src/promptpro/client/main.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText;
  runInNewContext(code, {
    exports: {}, document: { getElementById: node, querySelectorAll: () => [], documentElement: { dataset: {} } },
    navigator: { clipboard }, location: { hash: "" }, URLSearchParams,
    matchMedia: () => ({ matches: false, addEventListener() {} }), window: { addEventListener() {} },
  }, { timeout: 1000 });
  node("prompt").value = "Prompt editado.\nPreservar a quebra de linha.";
  assert.ok(handlers.has("copy:click"));
  handlers.get("copy:click")!();
  await setImmediate();
  return { prompt: node("prompt"), message: node("copy-status").textContent };
}
test("copy selects the edited text and explains manual copying when the API is missing or denied", async () => {
  for (const clipboard of [undefined, { writeText: async () => { throw new Error("denied"); } }]) {
    const result = await clickCopy(clipboard);
    assert.equal(result.prompt.focused, true); assert.equal(result.prompt.selected, true);
    assert.match(result.message, /Não foi possível copiar automaticamente/);
  }
});
test("copy passes the entire edited text unchanged and confirms success", async () => {
  let copied = "";
  const result = await clickCopy({ writeText: async (text) => { copied = text; } });
  assert.equal(copied, result.prompt.value);
  assert.equal(result.prompt.selected, false);
  assert.equal(result.message, "O prompt foi copiado com suas edições.");
});
