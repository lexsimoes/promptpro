# HANDOFF: current state of the project

> This file is the "handoff": any agent (or you, a month from now) reads it first to know where things stand.
> The agent updates it at the end of **every** mission.

**Updated on:** 2026-10-28 · **By:** mission 0002 items 1–3

## Current state

- Discovery done (PR #3): `specs/PRD.md` (CA-01 to CA-08, INV-003 to INV-006) and missions 0001–0003, approved by the owner on 2026-10-27. The deep review's findings on PR #3 (e2e isolation needs `test-approved`, `--ink-3` contrast, toggle semantics, fonts, e2e with no specs) are addressed in the missions and the mockup.
- Approved clickable mockup in `prototype/mockup/` (throwaway: flow and look reference, Ideal Match tokens with a darker `--ink-3` for WCAG AA; only Instrument Serif ships with it; no code is built on it).
- The template's demo app (coupon store, message classifier, INV-001/INV-002, their evals and e2e tests) is still in the repository and keeps working; mission 0001 removes it last, after promptPRO replaces it. Template issue: https://github.com/lexsimoes/ai-dev-template/issues/57.
- Domain: `getprompt.pro` (owned by the owner); publishing plan in mission 0002, item 2.
- Template: ai-dev-template v0.5.1 (PR #1), which fixed the red `quality` check that projects from v0.5.0 were born with.
- Secrets set (names only): `REVIEW_API_KEY`, `REVIEW_DEEP_API_KEY`, `EVAL_API_KEY`. Reviewer: DeepSeek, Claude on sensitive paths. Conversation language: `pt-BR`.
- Way of working: Codex implements the missions; Claude Code writes the prompts for Codex, reviews its results, and writes the end-to-end tests (mission 0003).

## Mission 0002 delivery (PR #6)

Owner selected deepseek-flash, initialv2+exact behavior-only sentence; two calibrations discarded/report-only. Twenty simulated cases/section validator. Local final20/20, judge3.95,40calls, USD .008408772; subsequent CI19/20,judge3.80 slow-dashboard/API, exact substring context unavailable. Owner approved finite variants/context for six collision-prone bans on2026-10-28, accepting coverage limits. New regression tests; runner/library/inputs/rubrics/limits/prompt unchanged. Next CI failure means stop. [Report](missions/0002-eval-report.md) preserves historical evidence/post-result corrections; no human review/holdout. CA-02 rules1/judge3.5 provisional until first real class; accuracy N/A/neutral0 delegated.

[Approved technical proposal](missions/0002-technical-proposal.md): vanilla TS/CSS,Vite8.3.5 dev-only,NetlifyFree,no storage/Redis; best-effort memory class counters,60/60s domain+IP, separate USD5prepaid/auto-rechargeOFF boundary. Full code/host/revocation/secret-policy/Preview decisions there; no provisioning/dependency added. No endpoint/UI/production invariants yet. Check/scan/review state in PR#6. Never merge or apply owner labels.

## Last mission

- Mission 0003, item 1 (2026-10-27): end-to-end test plan `specs/e2e/generate-prompt.md`, written by Claude Code before mission 0002's code. It lists what mission 0002 must provide for the tests (e2e class codes, class-link format, deterministic mock, provider failure on demand, accessible names). Owner decision recorded in it: "Gerar nova versão" replaces edits without confirmation.

## Queue (next items)

1. Mission 0004: former 0002 items 4–9 (endpoint/access/limits, INV-003–006, UI), same authorizations/prohibitions/acceptance; one planned review stop before Ready. Built next to the demo.
2. Mission 0003, items 2–4: end-to-end tests, after 0004 is merged.
3. Mission 0001: remove the template's demo app, last, once promptPRO replaces each of its pieces (reordered on 2026-10-27: the template's tooling tests depend on the demo).

Invariant tests still to create: INV-003, INV-004, INV-005, INV-006, all with mission 0004.

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
