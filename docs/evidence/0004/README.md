# Mission 0004 — review evidence

Local verification on 2026-10-28, using simulated ideas and the isolated mock. The PR remains a draft until the owner tests the hosted Preview. No credentials were read or copied and no owner label was applied by the agent. The owner authorized Netlify setup and the one-time import of the secret-free main branch; automatic production publishing was then locked before any environment variable was configured.

The only new direct dependency is Vite 8.3.5, pinned as a development dependency. It builds the separate vanilla TypeScript/CSS client and local fonts into `dist-promptpro`; no runtime SDK was added. Existing demo files, existing tests, CI, AI source and eval thresholds are unchanged.

## Verification

| Command or inspection | Result |
|---|---|
| `npm run check` | Lint and typecheck passed; 166 unit tests and 16 invariant tests passed, with no failures or skips. The PR's CI log is the persistent command evidence. |
| `npm run build:promptpro` | Passed; JavaScript 4.80 kB and CSS 7.25 kB before gzip. Four WOFF2 files total 91,968 bytes. |
| `node evals/run.ts --provider mock --suite generate-prompt --out evals/results/mission-0004-mock` | 20 of 20 rule checks passed; 20 of 60 allowed calls; no judge, tokens or cost. |
| Diff security review | Manual review and secret-pattern scan found no confirmed critical/high issue or key. This is not an independent security audit. |

No raw command output is committed. The mock run verifies wiring, not model quality. AI source, system prompt, golden set and runner are unchanged. The last real quality evidence is [PR #6 CI](https://github.com/lexsimoes/promptpro/actions/runs/40732915498): rules 20/20 and Flash judge 3.85; no new real-model evaluation was performed here.

## Deliberate violations

Each change was made only in a disposable copy without `.env`, then restored. All five mutant runs exited with failure; the unchanged invariant suite passed.

| Invariant | Deliberate break | Test that failed |
|---|---|---|
| INV-003 | Accept the first valid class after authorization fails | `INV-003: missing/unknown/expired/case-or-space-altered codes never reach the model` |
| INV-004 | Return the raw provider error, including a fabricated secret | `INV-004 catches raw provider errors: no key or class list in success/error responses` |
| INV-005 | Log the student's idea | `INV-005 catches logging/persistence: success, provider failure and refusals retain no student text` |
| INV-006 | Raise the input cap from 2000 to 3000 characters | `INV-006: 2000 characters reach the model, 2001/blank/invalid input never does` |
| INV-006 | Raise the requested token cap from 1500 to 9000 | `INV-006 catches a dropped cap: every completion explicitly requests at most 1500 tokens` |

The owner applied `invariant-approved` for the four new files. The subsequent CI invariant guard passed. Existing invariant files are untouched.

## Direction check

A local pass does not establish hosted behavior.

| Criterion | Evidence | State |
|---|---|---|
| CA-01 | Existing generator tests, new server tests and six ordered headings in the browser | Verified locally |
| CA-02 | Previous real CI: rules 20/20, judge 3.85; current mock: 20/20 | Partial: no fresh real run |
| CA-03 | Edited and fully rewritten text copied exactly in Chromium | Verified locally |
| CA-04 | Version 1 becomes version 2, replacing edits and retaining the original idea | Verified locally |
| CA-05 | Provider failure, retry and quota preserve the idea; server balance-error fixture | Verified locally |
| CA-06 | Missing, unknown, expired, space/case-altered links and expiry boundary | Verified locally |
| CA-07 | New, existing and absent choices reach the mock context | Verified locally |
| CA-08 | Screenshot matrix, official fonts, contrast, keyboard and overflow checks | Verified locally |
| INV-003 to INV-006 | Four new invariant files and the five violations above | Verified locally; owner label applied |

The stylesheet was reformatted into readable rules and declarations. Only whitespace changed; the built CSS and JavaScript have identical SHA-256 hashes before and after formatting. The PRD direction table now links to this README after the raw browser report was removed.

## Browser and screenshots

The running app was exercised in an isolated Chromium context. Checks covered suggestions, empty/disabled state, the 2000-character cap/counter, status choices, exact copying, regeneration, retry, class quota, invalid links and hash-only navigation. Model/student content rendered as literal text; local/session storage stayed empty. Keyboard focus was visible and actions had 44 px targets. No horizontal overflow was found.

Fresh-load diagnostics showed nine same-origin requests, all successful, no console errors/warnings and all four fonts loaded. Deliberate API refusals and failures produced expected network diagnostics. The intermediate 768 px breakpoint was also checked in both themes; those two captures remain local and are not committed.

| State | 375 light | 375 dark | 1280 light | 1280 dark |
|---|---|---|---|---|
| Start | [PNG](start-375-light.png) | [PNG](start-375-dark.png) | [PNG](start-1280-light.png) | [PNG](start-1280-dark.png) |
| Filled idea | [PNG](idea-375-light.png) | [PNG](idea-375-dark.png) | [PNG](idea-1280-light.png) | [PNG](idea-1280-dark.png) |
| Generating | [PNG](loading-375-light.png) | [PNG](loading-375-dark.png) | [PNG](loading-1280-light.png) | [PNG](loading-1280-dark.png) |
| Result | [PNG](result-375-light.png) | [PNG](result-375-dark.png) | [PNG](result-1280-light.png) | [PNG](result-1280-dark.png) |
| Copied edits | [PNG](copied-375-light.png) | [PNG](copied-375-dark.png) | [PNG](copied-1280-light.png) | [PNG](copied-1280-dark.png) |
| Provider failure | [PNG](error-375-light.png) | [PNG](error-375-dark.png) | [PNG](error-1280-light.png) | [PNG](error-1280-dark.png) |
| Inactive link | [PNG](inactive-375-light.png) | [PNG](inactive-375-dark.png) | [PNG](inactive-1280-light.png) | [PNG](inactive-1280-dark.png) |
| Class limit | [PNG](limit-375-light.png) | [PNG](limit-375-dark.png) | [PNG](limit-1280-light.png) | [PNG](limit-1280-dark.png) |

Representative start, result, error, inactive and limit captures were visually inspected. Text contrast: `ink-3` on paper 5.23:1 light / 6.00:1 dark; action text 5.75:1 / 6.68:1; orange heading 4.66:1 light. Official Google Fonts WOFF2 files, unmodified OFL licenses and a source/hash manifest are under `src/promptpro/client/public/fonts/`. No base64 or runtime font CDN is used. This is not a complete WCAG or pixel-perfect certification.

## Manual security review of the diff

The project's dedicated security skills were unavailable; this review used the project rules, source inspection and executable checks.

- Authorization checks exact code, active state and expiry before constructing the LLM client. Requests require an allowed HTTPS host and matching origin; preview hosts must be explicit, and production ignores the preview exception.
- The shared handler validates JSON, allowed fields, the 16 KiB body cap and 2000-character idea cap. The existing generator validates the six sections and requests at most 1500 output tokens. Invalid output and provider failures become generic errors.
- Secret/class-code sentinel tests cover built browser assets and success/error responses. No credential was read, copied or added to client imports. No analytics, storage SDK, content logging or browser persistence was added.
- Concurrent attempts reserve class quota before awaiting the model; failures consume quota. Netlify's generation function declares 60 requests per 60 seconds per domain/IP. The approved separate prepaid balance remains the spending boundary.
- Static, function and edge responses carry CSP, no-store, nosniff, no-referrer, frame denial, permissions restrictions and HSTS. The edge guard also checks HTML/assets. Dependency installation reported zero known vulnerabilities.

No confirmed critical/high issue was found. Limits: class counters reset on cold starts and are not shared across instances; platform rate enforcement may lag. A browser timeout cannot cancel the existing facade's upstream request, which may still consume tokens. Hosted edge/runtime behavior, native rate-limit response headers, platform logs, provider retention and billing still need verification. Code revocation requires redeployment and checking old deploy hosts.

## Netlify provisioning status

The owner authorized setup on 2026-10-28 and specifically confirmed the login terms and GitHub app authorization. The existing Netlify team is Viver de Sites. Project `promptpro` was unavailable, so the project was created as `lexsimoes-promptpro` and connected to `lexsimoes/promptpro`. The initial secret-free `main` import at e643a86 was published under the owner's bootstrap exception; **Auto Publishing Locked** was then confirmed in the UI. No DNS or custom domain was changed.

The expected PR #7 hostname is `deploy-preview-7--lexsimoes-promptpro.netlify.app`. Seven non-secret variables were saved only for Deploy Previews; Production, Branch deploys, Preview Server/Agent Runners and Local development contexts were left empty. All scopes are used because scope selection requires a paid plan. The existing sensitive variable policy is **Require approval** for untrusted forks.

`LLM_API_KEY` and `CLASS_CODES_JSON` are not configured yet. They remain owner-entered secrets; no model call is possible until the configuration is complete. The Preview build and hosted behavior are still pending. Keep the PR in draft.

## Preview setup reference

Variable names for the Deploy Previews context:

```text
APP_ENV
PREVIEW_HOST
CLASS_CODES_JSON
LLM_PROVIDER
LLM_BASE_URL
LLM_MODEL
LLM_EXTRA_BODY
LLM_API_KEY
AWS_LAMBDA_JS_RUNTIME
```

1. The project is connected and automatic production publishing is locked. The one-time secret-free bootstrap was explicitly allowed by the owner; no further production or DNS operation is authorized.
2. Use the build, publish and function/edge settings in `netlify.toml`. Build Node is pinned to 22.18.0. Configure the Node 22 runtime override in the UI and verify its patch version; it cannot be set in TOML.
3. Select explicit preview mode with `APP_ENV`; set `PREVIEW_HOST` to this PR's exact Netlify hostname, without scheme, path or wildcard. Build-only `CONTEXT` is not used for runtime authorization.
4. The owner alone copies the existing TEST key from their ignored `.env` into `LLM_API_KEY`. Configure the approved DeepSeek settings and only short-lived, low-limit TEST class entries using the `code`, `expiresAt`, `limit`, `active` schema. Never put real cohort codes in this preview.
5. Make custom variables available to Functions and Edge Functions. Do not use a `VITE_` prefix. In Project configuration → Environment variables → Site policies, set Sensitive variable policy to **Require approval** for forks/unrecognized authors. Mark secret values where the account supports it; never approve unreviewed fork code.
6. Test the reviewed Preview through `/#t=<TEST-code>`: real TEST generation, edits/copy, regeneration, failure, expiry/quota, headers, Node version, edge host rejection and the native rate rule. Rate limiting is declared in `functions/generate.ts`; Netlify does not accept that setting in TOML.
7. Return the working Preview URL. The owner applies `invariant-approved` and decides when the PR can become Ready.

Official documentation checked on 2026-10-28 after Context7's quota was exhausted: [Vite](https://vite.dev/config/), [Netlify function configuration](https://docs.netlify.com/build/functions/configuration/), [rate limits](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/), [runtime variables](https://docs.netlify.com/build/functions/environment-variables/), [edge configuration](https://docs.netlify.com/build/edge-functions/optional-configuration/), [edge API](https://docs.netlify.com/build/edge-functions/api/), [sensitive variable policy](https://docs.netlify.com/build/environment-variables/get-started/#sensitive-variable-policy).

## Not verified

Hosted Preview, its real-provider integration, fresh real-model/judge evaluation, Netlify edge/rate/secret settings and logs, DeepSeek retention and actual billing, complete WCAG/screen-reader accessibility and field performance. Formal promptPRO e2e automation remains mission 0003; the current CI e2e still measures the demo. Automatic review waits for Ready. No merge, tag, release or product production deployment was performed. The separate secret-free main bootstrap and publishing lock are recorded above.

## Automated review triage — PR #7

Initial Claude Sonnet review: 0 blockers, 3 important, 2 suggestions; estimated USD 0.1668. Low-risk fixes: native 60/60s protection on /api/access; privacy copy states the app does not save text and sends it to AI (provider retention remains unverified); clipboard failures now reach the selection fallback even if the API is absent or throws. A new DOM regression test reproduces the old failure and checks exact edited copy plus missing/denied API behavior.

Remaining: full client e2e coverage is the tracked mission 0003 (outside this mission); the copy regression adds partial automated client coverage. The shared build-directory suggestion touches tests/invariants/server-secrets.invariant.test.ts, so it was not auto-fixed; the owner must decide. No existing test or protected path was changed in this fix commit.
