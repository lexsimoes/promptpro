import { generatePrompt, MAX_IDEA_CHARS } from "../ai/generate-prompt.ts";
import type { LLMClient } from "../ai/llm.ts";
import { validClass } from "./access.ts";
import type { ClassCode } from "./access.ts";
import { reply, allowedHost } from "./security.ts";

export const MAX_BODY_BYTES = 16384;
interface Options { classes: ClassCode[]; client: () => LLMClient; e2e?: boolean; previewHost?: string; now?: () => number }
async function body(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("body");
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) throw new Error("body");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("body");
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.length;
      if (length > MAX_BODY_BYTES) { await reader.cancel(); throw new Error("body"); }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("body");
  return value as Record<string, unknown>;
}
/** Single boundary used by Netlify and local Node; never logs or persists request content. */
export function createHandler(options: Options): (request: Request) => Promise<Response> {
  const attempts = new Map<string, number>(); // Best effort, instance-local; reserve before awaiting the provider.
  const now = options.now ?? Date.now;
  return async (request) => {
    const url = new URL(request.url);
    if (!allowedHost(request, options.e2e, options.previewHost)) return reply(403, { error: "Este endereço não está ativo. Use o link da sua turma." });
    if (!["/api/access", "/api/generate"].includes(url.pathname)) return reply(404, { error: "Página não encontrada." });
    if (request.method !== "POST") return reply(405, { error: "Use o formulário para continuar." });
    if (request.headers.get("origin") !== url.origin) return reply(403, { error: "Use o link da sua turma para continuar." });
    let data: Record<string, unknown>;
    try { data = await body(request); } catch { return reply(400, { error: "Confira os dados e tente novamente." }); }
    if (Object.keys(data).some((key) => !["code", "idea", "projectStatus"].includes(key))) return reply(400, { error: "Confira os dados e tente novamente." });
    if (data.code === undefined || data.code === "") return reply(401, { error: "Este link não está ativo. Peça o link atualizado da turma." });
    if (typeof data.code !== "string" || data.code.length > 128) return reply(403, { error: "Este link não está ativo. Peça o link atualizado da turma." });
    const classroom = validClass(options.classes, data.code, now());
    if (!classroom) return reply(403, { error: "Este link não está ativo. Peça o link atualizado da turma." });
    if (url.pathname === "/api/access") return reply(200, { active: true });
    if (typeof data.idea !== "string" || !data.idea.trim() || data.idea.length > MAX_IDEA_CHARS ||
        (data.projectStatus !== undefined && data.projectStatus !== "new" && data.projectStatus !== "existing")) {
      return reply(400, { error: "Escreva uma ideia com até 2.000 caracteres e tente novamente." });
    }
    const used = attempts.get(classroom.code) ?? 0;
    if (used >= classroom.limit) return reply(429, { error: "A turma chegou ao limite por enquanto. Sua ideia continua aqui; fale com o responsável pelo curso." });
    attempts.set(classroom.code, used + 1);
    try {
      const result = await generatePrompt(data.idea, options.client(), data.projectStatus);
      if (result.needsHuman) return reply(502, { error: "Não foi possível gerar o prompt. Sua ideia continua aqui. Tente novamente." });
      return reply(200, { prompt: result.text });
    } catch (error: unknown) {
      const noBalance = error instanceof Error && error.message.startsWith("the provider answered HTTP 402:");
      return reply(noBalance ? 402 : 502, { error: "Não foi possível gerar o prompt. Sua ideia continua aqui. Tente novamente ou fale com o responsável pelo curso." });
    }
  };
}
