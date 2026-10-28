# HANDOFF: current state of the project

> This file is the "handoff": any agent (or you, a month from now) reads it first to know where things stand.
> The agent updates it at the end of **every** mission.

**Updated on:** 2026-10-28 · **By:** mission 0002 (items 1 and 2 closed; item 3 paused before runner changes)

## Current state

- Discovery done (PR #3): `specs/PRD.md` (CA-01 to CA-08, INV-003 to INV-006) and missions 0001–0003, approved by the owner on 2026-10-27. The deep review's findings on PR #3 (e2e isolation needs `test-approved`, `--ink-3` contrast, toggle semantics, fonts, e2e with no specs) are addressed in the missions and the mockup.
- Approved clickable mockup in `prototype/mockup/` (throwaway: flow and look reference, Ideal Match tokens with a darker `--ink-3` for WCAG AA; only Instrument Serif ships with it; no code is built on it).
- The template's demo app (coupon store, message classifier, INV-001/INV-002, their evals and e2e tests) is still in the repository and keeps working; mission 0001 removes it last, after promptPRO replaces it. Template issue: https://github.com/lexsimoes/ai-dev-template/issues/57.
- Domain: `getprompt.pro` (owned by the owner); publishing plan in mission 0002, item 2.
- Template: ai-dev-template v0.5.1 (PR #1), which fixed the red `quality` check that projects from v0.5.0 were born with.
- Secrets set (names only): `REVIEW_API_KEY`, `REVIEW_DEEP_API_KEY`, `EVAL_API_KEY`. Reviewer: DeepSeek, Claude on sensitive paths. Conversation language: `pt-BR`.
- Way of working: Codex implements the missions; Claude Code writes the prompts for Codex, reviews its results, and writes the end-to-end tests (mission 0003).
- Generator: DeepSeek V4 Flash, chosen by the owner on 2026-10-28; mission 0002 item 1 validates it rather than comparing providers. Authenticated discovery confirms `deepseek-flash` (current V4.1-Flash backend; the original V4 Flash is retired).

## Last mission

- Mission 0002 item 2 approved by the owner on 2026-10-28, draft PR https://github.com/lexsimoes/promptpro/pull/6: Netlify Free, Vite 8.3.5 dev-only, no Redis/storage. Per-class counters are best effort in process memory (cold-start/restart reset; not shared across instances). Native `/api/generate` limit: 60/60 s/domain+IP. Hard spending boundary: USD 5 prepaid in a production DeepSeek account separate from the reviewer, auto-recharge OFF; generic 402 preserves the idea. Codes last the class duration; revocation changes `CLASS_CODES_JSON` and redeploys (~1 minute estimate, 15 production-deploy credits). Production must refuse Host other than `getprompt.pro`. Public-repo sensitive variable policy: Require approval; keys marked Contains secret values; previews use low-balance TEST credentials/test codes only. Exact UI names and pricing discrepancy are documented in `docs/missions/0002-technical-proposal.md`. No infrastructure/dependency was provisioned.

- Mission 0002 item 1 closed by the owner on 2026-10-28: `deepseek-flash` approved despite failed criteria. V1: ambiguities 29/40 (72.5%). V2: 38/40 (95%), but one URL mention, one conservative mild feature addition, scope-proposing items 25 to 33, and 9/20 outputs with >6 question marks. V2 is the initial prompt; no more prototype rounds. Calibration moves to item 3, CA-02 unchanged. Compact evidence: `prototype/model-choice/REPORT.md`; raw outputs stay local. Total estimated cost USD 0.010287576. Assessment: leitura pelo agente (Codex); ainda sem revisão humana.

- Mission 0003, item 1 (2026-10-27): end-to-end test plan `specs/e2e/generate-prompt.md`, written by Claude Code before mission 0002's code. It lists what mission 0002 must provide for the tests (e2e class codes, class-link format, deterministic mock, provider failure on demand, accessible names). Owner decision recorded in it: "Gerar nova versão" replaces edits without confirmation.

## Queue (next items)

1. Mission 0002 item 3: paused before implementation pending owner authorization for suite-specific rule support in `evals/run.ts` and golden-case metadata typing in `evals/lib.ts`. The current runner only checks needsHuman, text length and mustNotContain; it passes only input/client to the target. No runner, test or eval file was changed. After authorization, implement golden set (10 prototype ideas + >=10 fresh ideas), question-count/technology/ambiguity rules and scope judge under unchanged CA-02 thresholds, then stop for owner review. Items 1 and 2 are closed in draft PR #6; endpoint, invariants and UI remain later items. Keep the PR draft.
2. Mission 0003, items 2–4: end-to-end tests, after 0002 is merged.
3. Mission 0001: remove the template's demo app, last, once promptPRO replaces each of its pieces (reordered on 2026-10-27: the template's tooling tests depend on the demo).

Invariant tests still to create: INV-003, INV-004, INV-005, INV-006, all with mission 0002.

## Pending decisions (owner)

- Confirm the domain registrar.
- Create a separate production DeepSeek account, add USD 5 and disable automatic recharge; keep it separate from the reviewer's account.
- Connect Netlify only when the preview stage starts.
- Set `EVAL_MODEL=deepseek-flash` in GitHub Actions; `EVAL_API_KEY` is already DeepSeek, but CI currently falls back to `deepseek-v4-pro`. No repository variable or CI file was changed.
- Check DeepSeek's request-retention policy before launch; tests do not establish it.

## Risks and warnings

- A class link can leak: expiry and redeploy-based revocation limit exposure. Per-class memory counters and IP limits are best effort; only the separate prepaid provider balance is the approved hard spending boundary. Verify canonical-host enforcement against old deployment URLs before launch.
- Local verification on 2026-10-28: `npm run check` stalled at `eslint .` and was terminated after 40 seconds; it is not verified as green. No test was edited or skipped.
- Before launch, verify Netlify secret controls, actual compute rate, request-body logging, runtime compatibility, DNS/HTTPS and preview behavior. The reported 5-versus-10 compute discrepancy was not reproduced: both official pages show 10 credits/GB-hour on 2026-10-28; estimate retains 10.
- Class size/concurrency/course platform are not known; shared classroom networks motivated the approved 60/60 s IP limit.
- Issue #2: reviewer `deepseek-flash` backend changed; its canary still needs to confirm it catches planted defects.
- Agents use the owner's GitHub account (option A in `docs/WORKFLOW.md`): only `AGENTS.md` stops an agent from merging or applying the owner's labels.

## How to resume

1. `npm ci`
2. `npm run check`
3. Read the next mission in `docs/missions/` or item 1 of the queue above.
