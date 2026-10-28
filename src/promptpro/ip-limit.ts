import { createHmac, randomBytes } from "node:crypto";
import { isIP } from "node:net";

export const IP_LIMIT = 10;
export const IP_WINDOW_MS = 60 * 60 * 1000;
const MAX_BUCKETS = 10000;

function normalize(ip: unknown): string | undefined {
  if (typeof ip !== "string" || !isIP(ip) || ip.includes("%")) return;
  if (isIP(ip) === 4) return ip;
  const canonical = new URL(`http://[${ip}]/`).hostname;
  const mapped = canonical.match(/^\[::ffff:([0-9a-f]+):([0-9a-f]+)\]$/);
  if (!mapped) return canonical;
  const high = parseInt(mapped[1]!, 16), low = parseInt(mapped[2]!, 16);
  return [high >> 8, high & 255, low >> 8, low & 255].join(".");
}

/** Immediate instance-local backstop. Netlify's edge rule supplies the shared limiter.
 * No raw address or request content is logged or persisted. Cold starts reset this map.
 */
export function createIpLimiter(now: () => number = Date.now) {
  const salt = randomBytes(32);
  const buckets = new Map<string, { used: number; expires: number }>();
  return (ip: unknown): { status: 200 | 429 | 503; retryAfter?: number } => {
    const address = normalize(ip);
    if (!address) return { status: 503 };
    const time = now();
    const key = createHmac("sha256", salt).update(address).digest("hex");
    let bucket = buckets.get(key);
    if (bucket && time >= bucket.expires) { buckets.delete(key); bucket = undefined; }
    if (!bucket) {
      if (buckets.size >= MAX_BUCKETS) {
        for (const [expiredKey, value] of buckets) if (time >= value.expires) buckets.delete(expiredKey);
        // Fail closed rather than evicting active quotas or growing without a bound.
        if (buckets.size >= MAX_BUCKETS) return { status: 503 };
      }
      bucket = { used: 0, expires: time + IP_WINDOW_MS };
      buckets.set(key, bucket);
    }
    if (bucket.used >= IP_LIMIT) return { status: 429, retryAfter: Math.max(1, Math.ceil((bucket.expires - time) / 1000)) };
    bucket.used++; // Reserve before awaiting the provider; failed attempts count too.
    return { status: 200 };
  };
}
