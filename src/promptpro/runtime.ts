import { createLLMClient } from "../ai/llm.ts";
import { createHandler } from "./handler.ts";
import { createPromptMock } from "./mock.ts";
import { reply } from "./security.ts";
export function providerFor(env: NodeJS.ProcessEnv): string {
  if (env.APP_ENV === "e2e") {
    if (env.LLM_PROVIDER !== "mock") throw new Error("Isolated mode accepts only the mock provider");
    return "mock";
  }
  if (!["production", "preview"].includes(env.APP_ENV ?? "") || env.LLM_PROVIDER !== "openai-compatible" || env.LLM_BASE_URL !== "https://api.deepseek.com" || env.LLM_MODEL !== "deepseek-flash") {
    throw new Error("Invalid server provider configuration");
  }
  return "openai-compatible";
}
export function createRuntime(env: NodeJS.ProcessEnv = process.env) {
  const provider = providerFor(env);
  const e2e = env.APP_ENV === "e2e";
  const previewHost = env.APP_ENV === "preview" ? env.PREVIEW_HOST : undefined;
  if (env.APP_ENV === "preview" && (!previewHost || !/^[a-z0-9-]+\.netlify\.app$/.test(previewHost))) throw new Error("Invalid preview host");
  let client: ReturnType<typeof createLLMClient> | undefined;
  const app = createHandler({ classes: [], publicAccess: true, e2e, previewHost, client: () => client ??= e2e ? createPromptMock() : createLLMClient({ provider }) });
  // Mock-only isolated calls use loopback; real deployments must supply platform context.ip.
  return (request: Request, clientIp?: string) => app(request, clientIp ?? (e2e ? "127.0.0.1" : undefined));
}
let handler: ReturnType<typeof createRuntime> | undefined;
export async function serve(request: Request, context?: { ip?: string }): Promise<Response> {
  try { handler ??= createRuntime(); return await handler(request, context?.ip); }
  catch { return reply(503, { error: "Não foi possível atender agora. Sua ideia continua aqui. Tente novamente mais tarde." }); }
}
