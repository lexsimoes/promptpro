import { getStore } from "@netlify/blobs";

/** Two real SDK clients, one isolated atomic fake service; never sends a network request. */
export function quotaStores() {
  const records = new Map<string, { text: string; etag: string }>();
  let version = 0;
  let writes = 0;
  const fetcher: typeof fetch = async (input, init) => {
    const req = new Request(input, init);
    const key = new URL(req.url).pathname;
    if (req.method === "GET") {
      const row = records.get(key);
      return row ? new Response(row.text, { headers: { etag: row.etag, "content-type": "application/json" } }) : new Response(null, { status: 404 });
    }
    if (req.method !== "PUT") throw new Error("Unexpected mock method");
    const text = await req.text();
    const old = records.get(key);
    if ((req.headers.get("if-none-match") === "*" && old) || (req.headers.has("if-match") && old?.etag !== req.headers.get("if-match"))) return new Response(null, { status: 412 });
    const etag = `"${++version}"`;
    records.set(key, { text, etag }); writes++;
    return new Response(null, { headers: { etag } });
  };
  const client = () => getStore({ name: "quota-test", siteID: "synthetic", token: "synthetic", edgeURL: "https://quota.test", uncachedEdgeURL: "https://quota.test", consistency: "strong", fetch: fetcher });
  return { client, records, writes: () => writes };
}
