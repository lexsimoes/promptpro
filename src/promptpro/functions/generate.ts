import { serve } from "../runtime.ts";
export default serve;
// Native limits belong in function config, not netlify.toml (Netlify documentation).
export const config = { path: "/api/generate", rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["domain", "ip"] } };
