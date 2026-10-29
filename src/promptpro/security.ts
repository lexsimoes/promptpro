export const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'";
export const SECURITY_HEADERS = {
  "Content-Security-Policy": CSP,
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000",
};
export function reply(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), { status, headers: { ...SECURITY_HEADERS, "Content-Type": "application/json; charset=utf-8" } });
}

export function allowedHost(request: Request, e2e = false, previewHost?: string): boolean {
  const url = new URL(request.url), host = request.headers.get("host");
  const allowed = e2e ? ["127.0.0.1", "localhost"].includes(url.hostname) :
    url.protocol === "https:" && (url.host === "getprompt.pro" || url.host === previewHost);
  return allowed && (host === null || host === url.host);
}
