# HANDOFF: current state of the project

> This file is the "handoff": any agent (or you, a month from now) reads it first to know where things stand.
> The agent updates it at the end of **every** mission.

**Updated on:** 2026-10-28 · **By:** mission 0004 (local implementation; owner review pending)

## Current state

- Discovery done (PR #3): `specs/PRD.md` (CA-01 to CA-08, INV-003 to INV-006) and missions 0001–0003, approved by the owner on 2026-10-27. The deep review's findings on PR #3 (e2e isolation needs `test-approved`, `--ink-3` contrast, toggle semantics, fonts, e2e with no specs) are addressed in the missions and the mockup.
- Approved clickable mockup in `prototype/mockup/` (throwaway: flow and look reference, Ideal Match tokens with a darker `--ink-3` for WCAG AA; only Instrument Serif ships with it; no code is built on it).
- The template's demo app (coupon store, message classifier, INV-001/INV-002, their evals and e2e tests) is still in the repository and keeps working; mission 0001 removes it last, after promptPRO replaces it. Template issue: https://github.com/lexsimoes/ai-dev-template/issues/57.
- Domain: `getprompt.pro` (owned by the owner); publishing plan in mission 0002, item 2.
- Template: ai-dev-template v0.5.1 (PR #1), which fixed the red `quality` check that projects from v0.5.0 were born with.
- Secrets set (names only): `REVIEW_API_KEY`, `REVIEW_DEEP_API_KEY`, `EVAL_API_KEY`. Reviewer: DeepSeek, Claude on sensitive paths. Conversation language: `pt-BR`.
- Way of working: Codex implements the missions; Claude Code writes the prompts for Codex, reviews its results, and writes the end-to-end tests (mission 0003).

## Active: mission 0004, final review stop

PR #6 merged at e643a86. Items 1–6 are implemented on `mission/0004-generate-endpoint-and-ui`; the mission's single [PR #7](https://github.com/lexsimoes/promptpro/pull/7) stays in draft. It adds the shared class-gated handler, Node/Netlify adapters, whole-site edge host guard, UI and four new invariant files. Demo files, AI source, existing tests and CI are untouched. Vite 8.3.5 is development-only; fonts are official local WOFF2 files with complete OFL licenses. Local checks passed: 166 unit tests, 16 invariants and 20 mock eval cases. Five deliberate violations failed in a disposable copy. Browser flows were checked in both themes at 375, 768 and 1280 px; 32 captures at 375 and 1280 px are included. [Evidence, security review and Preview steps](evidence/0004/README.md).

Netlify is now connected to the existing Viver de Sites team as `lexsimoes-promptpro`. The owner approved login terms, GitHub authorization and the one-time secret-free main import. Automatic production publishing was locked before configuring any variables. No DNS changed. Seven non-secret variables are restricted to Deploy Previews; the sensitive variable policy is Require approval for untrusted forks. The expected hostname for PR #7 is `deploy-preview-7--lexsimoes-promptpro.netlify.app`.

The owner still needs to enter `LLM_API_KEY` and `CLASS_CODES_JSON` as secrets; the agent has not read or copied the key. The Preview build and hosted integration are pending, so PR #7 remains in draft. The owner applied `invariant-approved`; CI quality, invariant and demo e2e checks passed. CSS formatting changes only whitespace and leaves built assets identical. AI is unchanged; the last real quality run is PR #6 (judge 3.85). Mission 0003 provides promptPRO e2e automation later. Keep one PR below 140,000 reviewer-counted characters; raw command logs remain outside the commit.

## Mission 0002 delivery (PR #6)

Owner selected deepseek-flash, initialv2+exact behavior-only sentence; two calibrations discarded/report-only. Twenty simulated cases/section validator. Local final20/20, judge3.95,40calls, USD .008408772; subsequent CI19/20,judge3.80 slow-dashboard/API, exact substring context unavailable. Owner approved finite variants/context for six collision-prone bans on2026-10-28, accepting coverage limits. New regression tests; runner/library/inputs/rubrics/limits/prompt unchanged. Next CI failure means stop. [Report](missions/0002-eval-report.md) preserves historical evidence/post-result corrections; no human review/holdout. CA-02 rules1/judge3.5 provisional until first real class; accuracy N/A/neutral0 delegated.

[Approved technical proposal](missions/0002-technical-proposal.md): vanilla TS/CSS,Vite8.3.5 dev-only,NetlifyFree,no storage/Redis; best-effort memory class counters,60/60s domain+IP, separate USD5prepaid/auto-rechargeOFF boundary. Full code/host/revocation/secret-policy/Preview decisions there; no provisioning/dependency added. No endpoint/UI/production invariants yet. Check/scan/review state in PR#6. Never merge or apply owner labels.

## Last mission

- Mission 0003, item 1 (2026-10-27): end-to-end test plan `specs/e2e/generate-prompt.md`, written by Claude Code before mission 0002's code. It lists what mission 0002 must provide for the tests (e2e class codes, class-link format, deterministic mock, provider failure on demand, accessible names). Owner decision recorded in it: "Gerar nova versão" replaces edits without confirmation.

## Queue (next items)

1. Mission 0004: implementation complete locally, awaits owner review/hosted Preview/Ready. Former 0002 items 4–9 (endpoint/access/limits, INV-003–006, UI), same authorizations/prohibitions/acceptance; one planned review stop before Ready. Built next to the demo.
2. Mission 0003, items 2–4: end-to-end tests, after 0004 is merged.
3. Mission 0001: remove the template's demo app, last, once promptPRO replaces each of its pieces (reordered on 2026-10-27: the template's tooling tests depend on the demo).

Mission 0004 adds INV-003, INV-004, INV-005 and INV-006. Their tests pass locally; the owner applied `invariant-approved`, and the CI guard passed.

## Pending decisions (owner)

- How many students per class and how many classes at once; where the course is hosted; one code per class (current plan) or one link per student later.
- Check DeepSeek request retention before launch; confirm registrar, connect Netlify at preview stage, and create separate USD 5 production account with auto-recharge OFF. No production/DNS without explicit approval after merge.
- Issue #2: DeepSeek reports a new backend for the reviewer's `deepseek-flash`; reviews go on, but run the review canary to confirm it still catches the planted defects.
- EVAL_API_KEY is DeepSeek TEST. Owner configured EVAL_MODEL=deepseek-flash, EVAL_JUDGE=1, EVAL_EXTRA_BODY={"temperature":0.2,"thinking":{"type":"disabled"}} (read-only verified). CI lacks EVAL_JUDGE_MODEL mapping; both roles Flash. Agent changed no variables/secrets.

## Risks and warnings

- A class link can leak: the code expiry, the usage limit and the provider's spending cap bound the damage.
- Agents use the owner's GitHub account (option A in `docs/WORKFLOW.md`): only `AGENTS.md` stops an agent from merging or applying the owner's labels.

## How to resume

1. `npm ci`
2. `npm run check`
3. Read the next mission in `docs/missions/` or item 1 of the queue above.
