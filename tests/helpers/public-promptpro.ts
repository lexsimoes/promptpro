import { createHandler } from "../../src/promptpro/handler.ts";
import type { LLMRequest } from "../../src/ai/llm.ts";
import { VALID, request } from "./promptpro.ts";
import { createSharedIpLimiter } from "../../src/promptpro/shared-quota.ts";
import type { QuotaStore } from "../../src/promptpro/shared-quota.ts";
import { quotaStores } from "./quota-store.ts";

export function publicHarness(options: { now?: () => number; fail?: boolean; store?: () => QuotaStore } = {}) {
  const calls: LLMRequest[] = [];
  let factories = 0;
  const service = options.store ?? quotaStores().client;
  const reserveIp = createSharedIpLimiter(service, options.now);
  const app = createHandler({ reserveIp, classes: [], publicAccess: true, now: options.now, client: () => {
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
