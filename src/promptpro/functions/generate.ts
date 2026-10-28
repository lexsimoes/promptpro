import { serve } from "../runtime.ts";
export default serve;
// Shared edge limiter; enforcement may lag by up to 10 seconds (Netlify documentation).
export const config = { path: "/api/generate", rateLimit: { windowLimit: 10, windowSize: 3600, aggregateBy: ["domain", "ip"] } };
