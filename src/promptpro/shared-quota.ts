import { createHmac, randomBytes } from "node:crypto";
import { IP_LIMIT, IP_WINDOW_MS, normalizeIp } from "./ip-limit.ts";

export interface QuotaStore {
  getWithMetadata(key: string, options: { type: "json"; consistency: "strong" }): Promise<{ data: unknown; etag?: string } | null>;
  setJSON(key: string, data: unknown, condition: { onlyIfNew: true } | { onlyIfMatch: string }): Promise<{ modified: boolean }>;
}
export interface Reservation { status: 200 | 429 | 503; retryAfter?: number }
const READ = { type: "json", consistency: "strong" } as const;

/** Cross-instance reservations. No fallback to memory if storage fails. */
export function createSharedIpLimiter(open: (signal: AbortSignal) => QuotaStore, now = Date.now) {
  return async (ip: unknown): Promise<Reservation> => {
    const address = normalizeIp(ip);
    if (!address) return { status: 503 };
    const signal = AbortSignal.timeout(5000);
    try {
      const store = open(signal);
      let seed = await store.getWithMetadata("_salt", READ);
      if (!seed) {
        await store.setJSON("_salt", randomBytes(32).toString("hex"), { onlyIfNew: true });
        seed = await store.getWithMetadata("_salt", READ);
      }
      if (typeof seed?.data !== "string" || !/^[a-f0-9]{64}$/.test(seed.data)) return { status: 503 };
      const key = createHmac("sha256", seed.data).update(address).digest("hex");
      for (let retry = 0; retry < 16; retry++) {
        signal.throwIfAborted();
        const row = await store.getWithMetadata(key, READ);
        const bucket = row?.data as { used?: unknown; expires?: unknown } | undefined;
        if (row && (!row.etag || !bucket || !Number.isInteger(bucket.used) || Number(bucket.used) < 1 || Number(bucket.used) > IP_LIMIT || typeof bucket.expires !== "number" || !Number.isSafeInteger(bucket.expires) || bucket.expires < 0)) return { status: 503 };
        const time = now();
        const active = bucket && time < Number(bucket.expires);
        if (active && Number(bucket.used) >= IP_LIMIT) return { status: 429, retryAfter: Math.max(1, Math.ceil((Number(bucket.expires) - time) / 1000)) };
        const next = { used: active ? Number(bucket.used) + 1 : 1, expires: active ? Number(bucket.expires) : time + IP_WINDOW_MS };
        const result = await store.setJSON(key, next, row ? { onlyIfMatch: row.etag! } : { onlyIfNew: true });
        if (result.modified === true) return { status: 200 };
      }
    } catch { return { status: 503 }; } // Never forward SDK errors or credentials.
    return { status: 503 }; // Contention exhaustion denies before the model.
  };
}
