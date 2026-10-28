# Mission 0005 evidence

Owner decision, 2026-10-28: public access, no class code, 10 generation attempts per IP per hour; replace INV-003 in a separate PR. Based on PR #7's implementation. Production publication is authorized; no merge, DNS change or production publication has been performed by the agent.

## Commands and counts

- `npm run check`: 171 unit tests and 16 invariants passed, no skips/failures.
- `npm run build:promptpro`: passed, Vite 8.3.5. AI source/model/prompt and dependencies unchanged; no new paid eval was required.
- `APP_ENV=e2e LLM_PROVIDER=mock PORT=3032 npm run start:promptpro`: public `/` opened without a fragment; generate → edit → copy matched the clipboard exactly → new versions 2–10 → eleventh attempt refused; the idea stayed editable. Synthetic text only, zero paid calls.
- Browser: 375/768/1280 px, no horizontal overflow; public entry captured in both themes at 375/1280. Limit captured at 375 dark / 1280 light. Console warnings observed came from the installed Grammarly extension, not application code.
- `node scripts/guard-invariants.ts`: owner-only invariant-approved is required on the new PR; the agent never supplies or applies it.
- Reviewer-filtered diff size and secret scan: see the PR's Checks run section; use splitDiff → filterFiles → redactSecrets → joined text length, not binary byte totals. Raw logs stay outside this commit.

| Disposable mutation | Test that failed |
|---|---|
| Raise local quota from 10 to 11 | INV-003 ten attempts; concurrent/failed attempts |
| Supply loopback when trusted IP is absent | INV-003 trusted client IP |
| Weaken native window from 3,600 to 60 seconds | INV-003 native rule assertion |

All three mutated runs exited 1. Restoring the code exited 0 (3/3 access invariants). No deliberate break was committed.

## Security review of this diff

- Public access is the owner's explicit behavior change. Hosted runtime always selects it and no longer reads CLASS_CODES_JSON. The legacy class branch remains only for unchanged isolated unit fixtures; request input cannot select access mode.
- Identity comes from Netlify context.ip or the Node socket, never from client JSON or forwarded headers. Missing/invalid identity fails closed before constructing the model client. IPv6 spelling and IPv4-mapped forms share a normalized key.
- Ten validated attempts reserve before await; provider failure and concurrent requests consume attempts. Retry-After is supplied on local 429. New networks get separate quotas.
- The backstop stores only process-salted HMAC identifiers and counters in memory, at most 10,000 active buckets; no raw IP, idea or prompt is written or logged. Full capacity fails closed; expired buckets can be reclaimed.
- Native function rule is 10 requests/3,600 seconds/domain+IP; it counts malformed requests too. No database/dependency, client key, public reset endpoint or spoofable identity fallback was added. Origin/host/size/output/CSP policies are preserved.
- No confirmed security defect remains in the reviewed diff. Important limitation: Netlify enforcement can lag up to ten seconds and the memory backstop is instance-local/reset on cold starts, so these controls do not guarantee a strict distributed ten-call ceiling. Shared networks share a quota; rotating addresses can bypass it. A separate prepaid account with automatic recharge off remains the cost boundary.

## Screenshots

| State | Light | Dark |
|---|---|---|
| Public entry, 375 px | [capture](375-light.png) | [capture](375-dark.png) |
| Public entry, 1280 px | [capture](1280-light.png) | [capture](1280-dark.png) |
| Usage limit | [1280 px](limit-1280-light.png) | [375 px](limit-375-dark.png) |

## Hosted verification and production prerequisites

The new Preview must use APP_ENV=preview and PREVIEW_HOST matching its PR number; existing TEST-key secret may remain in Deploy Previews, entered privately by the owner. CLASS_CODES_JSON is no longer used by this branch. Preview #8 deployed successfully after a branch-specific PREVIEW_HOST override; the PR #7 host was preserved. At https://deploy-preview-8--lexsimoes-promptpro.netlify.app/ two real TEST-provider generations succeeded without a code; edited copy matched the clipboard and regeneration replaced edits with six sections. Native rule enforcement remains unverified. Do not run a burst/load test against a real provider to prove the quota.

The owner merges reviewed changes; the agent never merges. Before public production: verify DeepSeek retention and prepaid cap/auto-recharge, provide the production LLM_API_KEY privately, configure APP_ENV=production and the provider variables in the Production context, connect getprompt.pro at the registrar, verify DNS/HTTPS and then publish the reviewed build. No credentials were read/copied and no production secrets were configured in this work. DNS lookup returned artemis.dns-parking.com / hermes.dns-parking.com; no DNS was changed.

## Documentation sources

Context7 resolve-library-id was attempted and returned monthly quota exhausted. Official documentation consulted on 2026-10-28:
- [Rate limiting and enforcement timing](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/).
- [Function context.ip and rateLimit configuration](https://docs.netlify.com/build/functions/api/).
