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

Owner-selected DeepSeek V4 Flash (deepseek-flash, current V4.1 backend); generator/section validator +20 simulated golden cases. Initial v2 plus exact final owner sentence; both earlier calibrations discarded/report-only. Three diversion rubrics corrected after old judge penalized correct refusal; other cases/bans unchanged. Final one-run result: rules20/20, Flash judge3.95 (prototype4/new3.9), 40 calls, zero failures/retries; estimated USD .008408772. CA-02 minimum1.0/3.5 provisional until first real class; accuracy N/A/neutral0 delegated. [Report](missions/0002-eval-report.md) preserves historical failures/costs and post-result changes. Same CI protocol may score differently. Raw records ignored/local; no human review or untouched holdout.

Approved [technical proposal](missions/0002-technical-proposal.md): vanilla TS/CSS, Vite8.3.5 dev-only, NetlifyFree, no Redis/storage. Best-effort memory class counters reset/not shared; domain+IP60/60s; separate USD5 prepaid/auto-rechargeOFF spending boundary; 402 preserves idea. Expiring codes/redeployment revocation (~1min/15credits). Canonical getprompt.pro host only; public-repo Require approval/Contains secret values, TEST previews only. No provisioning/dependency added. Verify actual compute10credits/GB-hour, runtime, body logging, secret controls, host enforcement, DNS/HTTPS/Preview before launch.

Fresh check155 unit/8 invariants passes. Mock plumbing only; four initial flow failures fixed solely in new target, no existing test/demo change. Dataless dependencies read/materialized without installation. No endpoint/UI/production invariants/retention/billing verified. Next mission0004 owns remaining product acceptance; automatic review/check state in PR #6. Never merge or apply owner labels.

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
