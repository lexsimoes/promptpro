# Mission 0002 item 2 — technical proposal

**2026-10-28 · Awaiting owner approval; recommendations only.** No installation, account connection, DNS, deployment or CI/product/test/eval change. Vendor links below were consulted on this date; Context7 resolution failed (monthly quota), so official documentation was used. Item 1 is closed: `deepseek-flash`, starting prompt v2; calibration belongs to item 3.

## 1. Stack, hosting and repository fit

**Recommend vanilla TypeScript/CSS + Vite 8.3.5 (development dependency only) + Netlify Free.** Vite's vanilla-TS build supports Node 22.12+, compatible with this repository's >=22.18. No new runtime SDK; standard Request/Response and fetch. Retain TypeScript 6.0.3, node:test and Playwright 1.64.1. A serverless adapter and local Node e2e server share the new handler; preserve the demo. All application LLM calls go through `src/ai/llm.ts`. [Vite guide](https://vite.dev/guide/), [version](https://registry.npmjs.org/vite/8.3.5), [function API](https://docs.netlify.com/build/functions/api/).

Netlify Free: **$0/month, 300 shared credits/month**, unlimited PR previews, custom-domain HTTPS, two code-based rate-limit rules. Exhaustion pauses projects. Pin build Node 22.18+ and runtime `nodejs22.x` explicitly, not an open engine range that selects Node 24; platform patch versions must be verified in preview. [Pricing](https://www.netlify.com/pricing/), [previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/), [runtime/config](https://docs.netlify.com/build/functions/configuration/).

**Alternative: same frontend on Vercel Node 22 Functions, Pro from $20/month for one developer**, plus usage overages. PR previews, scoped variables and native WAF rate limiting are available. Hobby ($0) permits only non-commercial use; do not assume this course qualifies. Higher baseline cost; same distributed-counter problem. [Runtime](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [previews](https://vercel.com/docs/deployments/environments), [pricing/terms](https://vercel.com/pricing), [WAF limits](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

## 2. Class configuration and links

Server-only `CLASS_CODES_JSON`: entries with exact code, expiry such as `2026-12-31T23:59:59-03:00`, positive usage limit and active flag. Owner creates/renews/revokes entries in hosting configuration; propose a total-attempt quota per code validity, renewed with a new code/version. Never expose the full list or use a public `VITE_` secret. **Netlify and Vercel require a new deployment to apply environment changes**: no application-code edit, but not instant revocation. Restrict production to its canonical host and retire old deployments so old URLs cannot accept revoked codes; verify before launch. Instant revocation needs approved remote state. [Netlify env lifecycle](https://docs.netlify.com/build/functions/environment-variables/), [Vercel env lifecycle](https://vercel.com/docs/environment-variables).

Link: `https://getprompt.pro/#t=<percent-encoded-code>`. Browser holds the decoded code in memory, sending it in JSON POST to `/api/access` and every `/api/generate` (only generation consumes quota). Server checks validity/expiry before LLM. Fragments are absent from HTTP targets and Referer, but browser history/JavaScript can expose them: no third-party analytics/session replay. The idea travels only in POST, never URL/query/header. [Fragment](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment), [Referer stripping](https://www.w3.org/TR/referrer-policy/#strip-url).

## 3. Usage limits: production decision required

Per IP: propose Netlify native `/api/generate` rate limit **30 requests/60 seconds/domain+IP**, returning 429; reserve the second Free rule for access checks. Confirm shared-classroom NAT tolerance. Enforcement can lag up to ten seconds, so this is abuse mitigation, not a strict cost ceiling. [Native rules/limits](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/).

| Per-class option | Cost | Reliability / risk |
|---|---|---|
| Process-memory counter | $0 | Resets on cold start/restart; separate instances race. **Not acceptable as a strict production quota.** |
| IP limits + provider balance only | Included | Does not enforce a class total; requires an explicit product-scope change, not assumed here. |
| **Recommend optional atomic Redis counter, only if owner approves storage exception** | Upstash Free: 256 MB/500k commands/month; paid usage $0.20/100k commands | Shared atomic compare/increment with expiry before LLM; fail closed if unavailable. Store only opaque class ID/count/expiry, never student text or raw code. Added service/outage/security boundary. |

[Redis pricing](https://upstash.com/pricing/redis), [atomic scripting over REST](https://upstash.com/blog/lua-scripting-on-upstash-redis-atomic-operations-over-http). Count reserved attempts, including uncertain timeouts, without automatic refund, subject to approval. Without a storage exception this recommendation cannot meet strict production class quotas. Keep a bounded DeepSeek prepaid balance as the last barrier (402 on insufficient balance); account-specific caps/auto-recharge controls remain unverified. [Provider errors](https://api-docs.deepseek.com/quick_start/error_codes/).

E2e uses mock-only isolated Node mode, an in-memory `turma-e2e-limite` quota of **one per process**, valid/expired fixtures and deterministic versions from the approved plan. It proves no production guarantee; isolation wiring remains mission 0003 with owner approval.

## 4. Input/output caps and retries

Reject empty or >2,000-character ideas on the server before LLM. Preserve **1,500 output tokens**, temperature 0.2, thinking off; v2 measured mean **373.75**, maximum **487** output tokens. Propose 20-second upstream timeout and 25-second browser wait; Netlify synchronous ceiling is 60 seconds. Current adapter defaults to 120 seconds: later implementation needs additive timeout configuration through the LLM factory and a safe allowlist for extra body fields so max_tokens cannot be overridden. No automatic LLM retries; one in-flight submission. Manual retry/new version may cost again; retain the idea after failure. [Function limits](https://docs.netlify.com/build/functions/configuration/), [measured evidence](../../prototype/model-choice/REPORT.md).

## 5. Privacy and security gates

Netlify observability records URL/query, IP, method/status and request metadata; function logs include invocations and explicit console statements. These docs **do not prove request bodies are never captured**. Launch gate: send sentinels, inspect platform/error logs and settings; seek provider confirmation if needed. Allowlist application logs: event type, random request ID, duration, counts; never raw errors/text/bodies/codes/headers. Disable payload tracing, analytics/replay, response caching and browser/disk persistence; INV-005 tests plus platform inspection are required. [Observability](https://docs.netlify.com/manage/monitoring/observability/overview/), [function logs](https://docs.netlify.com/build/functions/logs/).

LLM key in hosting variables, never public prefixes/bundles (INV-004). On Free, variables also reach builds; Functions-only scope requires Pro. Separate TEST key/test codes for previews; production credentials only in production context, with trusted builds and artifact scanning. Same-origin API; validate browser Origin against the exact environment, no wildcard CORS. Validate class code regardless of CORS. Generic errors; no provider body/stack. Propose CSP `default-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`, self-host fonts/assets, nosniff, Referrer-Policy no-referrer and Cache-Control no-store. Set headers on function responses too: static `_headers` alone does not cover them. [Header behavior](https://docs.netlify.com/manage/routing/headers/).

## 6. Publishing getprompt.pro — owner-approved steps only

After approval, owner connects hosting/GitHub, configures TEST-only PR previews, verifies Node/limits/privacy/e2e and locks auto-publishing while previews build. Only after mission merge **and separate explicit production approval**, owner publishes with production secrets. [Publish lock](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/).

**registrador a confirmar com o dono**. Owner verifies dashboard instructions, preserves email records and creates apex `@` ALIAS/ANAME/flattened CNAME to `apex-loadbalancer.netlify.com`; fallback A `75.2.60.5` if unsupported. `www` CNAME points to the assigned `<site>.netlify.app`; actual site name awaits setup. Verify HTTPS/redirects and automatic certificate renewal. [DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/), [managed HTTPS](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/). No DNS/deploy action is authorized by this proposal.

## 7. Monthly estimate — USD, excluding tax/domain

20 generations/student; use v2 measured $0.0002642424/call. Illustrative Netlify budget: four production deploys (60 credits), <=2 GB traffic (40), <=20k total requests (4), plus 1 GB function memory × **5 seconds/call** (conservative versus measured 2.182s) at 10 credits/GB-hour. Includes assumed preview/shared-project usage; exceeding assumptions can pause the Free sites. [Hosting rates](https://www.netlify.com/pricing/), [compute accounting](https://docs.netlify.com/build/functions/usage-and-billing/), [DeepSeek prices, checked 2026-10-28](https://api-docs.deepseek.com/quick_start/pricing/).

| Students | Calls | Hosting credits / monthly $ | LLM estimate | Total with Netlify Free | Vercel Pro baseline + LLM |
|---:|---:|---:|---:|---:|---:|
| 30 | 600 | 112.3 / $0 | $0.159 | $0.159 | >=$20.159 |
| 100 | 2,000 | 131.8 / $0 | $0.528 | $0.528 | >=$20.528 |
| 300 | 6,000 | 187.3 / $0 | $1.585 | $1.585 | >=$21.585 |

Optional Redis cost $0 only within its approved free quota, otherwise additive. LLM sample was off-peak with cache hits: peak rates double; cache misses, longer output, failures/manual retries, attacks and future prices can increase cost. Not a spending guarantee.

## 8. Owner decisions / not verified

- Approve recommended stack or alternative and exact Vite version; no dependency installed.
- Approve/reject counter storage, quota period/attempt counting and IP/shared-NAT thresholds; without approval strict class quotas remain blocked.
- Accept environment-change redeploy/revocation procedure, or approve remote revocation state.
- Confirm class sizes, registrar, preview TEST credentials and production/last-barrier budget; owner sets `EVAL_MODEL=deepseek-flash` and checks DeepSeek retention.
- Not verified: hosting account/plan availability, deployed Node/adapter compatibility, live previews/firewall, old-deploy revocation, actual body capture, Redis failure/concurrency, DNS/HTTPS, billing, fresh holdout quality. No existing test needs editing for this document; future conflicts stop for owner review.

**Stop at item 2 review.** No accounts, credentials, dependencies, DNS, hosting integration or deployments were created or changed.
