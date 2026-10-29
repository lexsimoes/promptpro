import { serve } from "../runtime.ts";
export default serve;
export const config = { path: "/api/access", rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["domain", "ip"] } };
