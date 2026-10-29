import { createHandler } from "../../src/promptpro/handler.ts";
import type { ClassCode } from "../../src/promptpro/access.ts";
import type { LLMRequest } from "../../src/ai/llm.ts";
export const VALID = "## Objetivo\nCriar o pedido.\n## Contexto\nInformado pelo aluno.\n## Requisitos\nPreservar o pedido.\n## Restrições\nSem novidades.\n## Critérios de conclusão\nPedido atendido.\n## A esclarecer\nO que falta decidir?";
export const CLASSES: ClassCode[] = [{ code: "turma-secreta-443", expiresAt: "2026-12-31T23:59:59-03:00", limit: 20, active: true }];
export function harness(options: { text?: string; fail?: string; classes?: ClassCode[]; now?: () => number; limit?: number } = {}) {
  const calls: LLMRequest[] = []; let factories = 0;
  const classes = options.classes ?? CLASSES.map((c) => ({ ...c, limit: options.limit ?? c.limit }));
  const app = createHandler({ classes, now: options.now ?? (() => Date.parse("2026-12-01T00:00:00Z")), client: () => {
    factories++;
    return { name: "mock", async complete(request) { calls.push(request); if (options.fail) throw new Error(options.fail); return { model: "mock", text: options.text ?? VALID }; } };
  } });
  return { app, calls, factories: () => factories };
}
export function request(data: Record<string, unknown>, path = "/api/generate", origin = "https://getprompt.pro"): Request {
  return new Request(origin + path, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(data) });
}
export const payload = (idea = "Quero um site.") => ({ code: CLASSES[0]!.code, idea });
