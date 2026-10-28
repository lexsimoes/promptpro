import { createHandler } from "../../src/promptpro/handler.ts";
import type { LLMRequest } from "../../src/ai/llm.ts";
import { VALID, request } from "./promptpro.ts";

export function publicHarness(options: { now?: () => number; fail?: boolean } = {}) {
  const calls: LLMRequest[] = [];
  let factories = 0;
  const app = createHandler({ classes: [], publicAccess: true, now: options.now, client: () => {
    factories++;
    return { name: "mock", async complete(input) {
      calls.push(input);
      if (options.fail) throw new Error("simulated failure");
      return { model: "mock", text: VALID };
    } };
  } });
  return { app, calls, factories: () => factories };
}
export const publicRequest = () => request({ idea: "Quero um site simples." });
