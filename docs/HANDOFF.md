# HANDOFF: current state of the project

> This file is the "handoff": any agent (or you, a month from now) reads it first to know where things stand.
> The agent updates it at the end of **every** mission.

**Updated on:** 2026-10-28 · **By:** mission 0002 (item 1 closed; item 2 awaiting review)

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

- Mission 0002 item 2: documentation-only proposal in `docs/missions/0002-technical-proposal.md`, draft PR https://github.com/lexsimoes/promptpro/pull/6. Recommends vanilla TypeScript/Vite + Netlify; Vercel Pro alternative. Strict production class quota needs an explicitly approved shared counter; no storage/hosting/dependency is approved or provisioned. Stop for owner review.

- Mission 0002 item 1 closed by the owner on 2026-10-28: `deepseek-flash` approved despite failed criteria. V1: ambiguities 29/40 (72.5%). V2: 38/40 (95%), but one URL mention, one conservative mild feature addition, scope-proposing items 25 to 33, and 9/20 outputs with >6 question marks. V2 is the initial prompt; no more prototype rounds. Calibration moves to item 3, CA-02 unchanged. Compact evidence: `prototype/model-choice/REPORT.md`; raw outputs stay local. Total estimated cost USD 0.010287576. Assessment: leitura pelo agente (Codex); ainda sem revisão humana.

- Mission 0003, item 1 (2026-10-27): end-to-end test plan `specs/e2e/generate-prompt.md`, written by Claude Code before mission 0002's code. It lists what mission 0002 must provide for the tests (e2e class codes, class-link format, deterministic mock, provider failure on demand, accessible names). Owner decision recorded in it: "Gerar nova versão" replaces edits without confirmation.

## Queue (next items)

1. Mission 0002 item 2: [technical proposal](missions/0002-technical-proposal.md) written and awaiting owner approval in draft PR #6; then item 3 (>=10 fresh ideas, question-count/technology rules and scope judge), invariants INV-003 to INV-006 and UI next to the demo.
2. Mission 0003, items 2–4: end-to-end tests, after 0002 is merged.
3. Mission 0001: remove the template's demo app, last, once promptPRO replaces each of its pieces (reordered on 2026-10-27: the template's tooling tests depend on the demo).

Invariant tests still to create: INV-003, INV-004, INV-005, INV-006, all with mission 0002.

## Pending decisions (owner)

- How many students per class and how many classes at once; where the course is hosted; one code per class (current plan) or one link per student later.
- Item 1 is approved/closed. Approve item 2 before dependencies or hosting setup; item 3 needs >=10 fresh ideas and question-versus-scope calibration.
- Technology and hosting: from mission 0002's technical proposal.
- Check DeepSeek's data-retention policy for requests before launch (not covered by the tests).
- Issue #2: DeepSeek reports a new backend for the reviewer's `deepseek-flash`; reviews go on, but run the review canary to confirm it still catches the planted defects.
- `EVAL_API_KEY` already belongs to DeepSeek (owner confirmation). Set the GitHub Actions variable `EVAL_MODEL=deepseek-flash` to evaluate the chosen Flash model: `.github/workflows/evals.yml` currently falls back to `deepseek-v4-pro`. The owner defines this variable; agents have not changed CI, repository variables or eval files.

## Risks and warnings

- A class link can leak: the code expiry, the usage limit and the provider's spending cap bound the damage.
- Agents use the owner's GitHub account (option A in `docs/WORKFLOW.md`): only `AGENTS.md` stops an agent from merging or applying the owner's labels.

## How to resume

1. `npm ci`
2. `npm run check`
3. Read the next mission in `docs/missions/` or item 1 of the queue above.
