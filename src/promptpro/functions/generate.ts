import { serve } from "../runtime.ts";
export default serve;
// Burst mitigation only; the Blobs CAS counter enforces the hourly quota.
export const config = { path: "/api/generate", rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["domain", "ip"] } };
