import { allowedHost, reply, SECURITY_HEADERS } from "../security.ts";
/** Apply the canonical host policy before static assets and serverless endpoints alike. */
export async function hostGate(request: Request, next: () => Promise<Response>, mode?: string, previewHost?: string): Promise<Response> {
  if (!["production", "preview"].includes(mode ?? "") || (mode === "preview" && (!previewHost || !/^[a-z0-9-]+\.netlify\.app$/.test(previewHost)))) {
    return reply(503, { error: "Este endereço ainda não está disponível." });
  }
  if (!allowedHost(request, false, mode === "preview" ? previewHost : undefined)) return reply(403, { error: "Este endereço não está ativo. Use o link da turma." });
  try {
    const upstream = await next();
    const headers = new Headers(upstream.headers);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) headers.set(key, value);
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
  } catch { return reply(503, { error: "Não foi possível atender agora. Tente novamente mais tarde." }); }
}
export default function host(request: Request, context: { next: () => Promise<Response> }): Promise<Response> {
  const netlify = (globalThis as typeof globalThis & { Netlify?: { env: { get: (key: string) => string | undefined } } }).Netlify;
  return hostGate(request, () => context.next(), netlify?.env.get("APP_ENV"), netlify?.env.get("PREVIEW_HOST"));
}
