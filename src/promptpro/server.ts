import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { pathToFileURL } from "node:url";
import { createRuntime } from "./runtime.ts";
import { MAX_BODY_BYTES } from "./handler.ts";
import { SECURITY_HEADERS, reply, allowedHost } from "./security.ts";

export function startServer(port = Number(process.env.PORT ?? 3030)) {
  const handler = createRuntime(); // Refuse a real provider in e2e before listening.
  const root = resolve("dist-promptpro");
  const types: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml" };
  return createServer(async (req, res) => {
    const send = async (response: Response) => {
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer()));
    };
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "127.0.0.1"}`);
      const hostRequest = new Request(url, { headers: { host: req.headers.host ?? url.host } });
      if (!allowedHost(hostRequest, process.env.APP_ENV === "e2e", process.env.APP_ENV === "preview" ? process.env.PREVIEW_HOST : undefined)) { await send(reply(403, { error: "Este endereço não está ativo." })); return; }
      if (url.pathname.startsWith("/api/")) {
        const chunks: Buffer[] = []; let length = 0;
        for await (const chunk of req) {
          length += chunk.length;
          if (length > MAX_BODY_BYTES) { await send(reply(413, { error: "A ideia é muito longa. Use até 2.000 caracteres." })); return; }
          chunks.push(Buffer.from(chunk));
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) if (typeof value === "string") headers.set(key, value);
        await send(await handler(new Request(url, { method: req.method, headers, ...(!["GET", "HEAD"].includes(req.method ?? "GET") ? { body: Buffer.concat(chunks) } : {}) }), req.socket.remoteAddress));
        return;
      }
      if (!["GET", "HEAD"].includes(req.method ?? "")) { await send(reply(405, { error: "Use o formulário." })); return; }
      const path = resolve(root, "." + decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
      if (!path.startsWith(root + sep) || !types[extname(path)]) { await send(reply(404, { error: "Página não encontrada." })); return; }
      try {
        const bytes = await readFile(path);
        res.writeHead(200, { ...SECURITY_HEADERS, "Content-Type": types[extname(path)]! });
        res.end(req.method === "HEAD" ? undefined : bytes);
      } catch { await send(reply(404, { error: "Página não encontrada." })); }
    } catch { if (!res.headersSent) await send(reply(500, { error: "Não foi possível atender agora." })); else res.end(); }
  }).listen(port, "127.0.0.1");
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) startServer();
