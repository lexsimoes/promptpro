# Mission 0004: Generate endpoint and UI

**Status:** in progress — implementation verified locally; owner review/Preview pending
**Branch:** `mission/0004-generate-endpoint-and-ui` · **PR:** [#7](https://github.com/lexsimoes/promptpro/pull/7)
**Created / approved by the owner:** 2026-10-28

## Goal

A student can use the class link to generate, edit, regenerate and copy a prompt, with server-side access/usage checks and no student content storage/logging. This mission inherits former mission 0002 items 4–9; do not implement them in PR #6.

## Context

Endpoint/UI slice of `specs/PRD.md`: CA-01 to CA-08 and the non-negotiables INV-003 to INV-006. The approved mockup is `prototype/mockup/` (throwaway: reference for flow and look, no code is built on it). Visual identity: the Ideal Match tokens and fonts reproduced in the mockup's CSS.

Decisions already taken by the owner:
- Students only, one code per class in the link, with an expiry date and a usage limit. No accounts, no passwords, no database.
- DeepSeek V4 Flash, chosen by the owner on 2026-10-28; the prototype validates it, with reasoning off or minimal. The official current ID is `deepseek-flash` (DeepSeek-V4.1-Flash-1017); the provider retired the original V4 Flash and routes its legacy alias to this backend.
- Technology and hosting approved on 2026-10-28: vanilla TypeScript/CSS, Vite 8.3.5 as a development dependency, and Netlify Free. No Redis or storage; best-effort process-memory class counters, Netlify domain+IP rate limit (60/60 s), and USD 5 prepaid production DeepSeek balance with auto-recharge off, in an account separate from the reviewer. See the approved technical proposal.
- Domain: the owner bought `getprompt.pro`; the app is published there. Publishing to production (and any DNS change) happens only with the owner's explicit approval, after this mission's PR is merged.
- DeepSeek is both the generator provider and the PR reviewer; these roles have separate configuration and validation.

The template's demo app stays in the repository during this mission and must keep working: build promptPRO next to it, without editing or deleting demo files. Mission 0001 removes the demo after missions 0004 and 0003. Mission 0003 writes the end-to-end tests from `specs/e2e/generate-prompt.md` (its item 1 is already approved).

promptPRO's server gets its own file and its own new test under `tests/unit/`, with the same isolated end-to-end mode the demo has today (for reference only: `providerFor` in `src/web/server.ts`, tested in `tests/unit/web.test.ts`; do not edit them): with `APP_ENV=e2e` it accepts only `LLM_PROVIDER=mock` and refuses any real provider. It also provides everything listed in `specs/e2e/generate-prompt.md`, "What mission 0002 must provide for these tests" (e2e class codes, class-link format, deterministic mock with `Versão N`, provider failure on `E2E-FALHA-PROVEDOR`, accessible names). Keep the PR under the reviewer's 150,000-character diff limit: if it would go over, stop and propose a split.

## Authorization

What the agent **may** do without asking:
- create files in `prototype/model-choice/` (throwaway), `src/**`, `tests/unit/**`, `evals/golden/generate-prompt.jsonl` (new cases), and the new suite and target in `evals/config.json` / `evals/targets.ts`;
- create the invariant tests named below, in this mission's PR, from the cases in `specs/PRD.md`;
- add a provider adapter in `src/ai/providers/` if the chosen model needs one.

What the agent **may not** do (it stops and asks):
- edit, skip or weaken any existing file in `tests/invariants/`;
- edit or delete any demo file or existing test (the demo goes in mission 0001);
- change `e2e/fixtures.ts` or `playwright.config.ts` (it needs the owner's `test-approved`; mission 0003 plugs promptPRO's server into Playwright);
- add a database or any persistent storage (including a hosted key-value store for the usage limit) without the owner's approval;
- add dependencies or pick the hosting beyond mission 0002 item 2's approved stack/hosting and exact dependency scope;
- send real student ideas to a model without saying so; ideas that are not from real students are marked `simulated` in the golden set;
- change the CI, `.github/**`, `AGENTS.md` or the eval thresholds after the owner sets them.

## Items

Original items 4–9 are renumbered 1–6 below with their authorization, prohibitions and acceptance preserved. Reuse the generator/validator and new unit-test file from mission 0002; extend the product wiring rather than replacing approved tooling.

- [x] 1. Class-code check on the server and its invariant test `tests/invariants/access.invariant.test.ts` (INV-003, cases from the PRD).
- [x] 2. Generation endpoint with input and output caps, secrets kept on the server and no student text in logs, with `tests/invariants/model-limits.invariant.test.ts` (INV-006), `tests/invariants/server-secrets.invariant.test.ts` (INV-004) and `tests/invariants/student-content.invariant.test.ts` (INV-005).
- [x] 3. Prompt builder and its unit tests `tests/unit/generate-prompt.test.ts` (CA-01 sections, CA-07 new/existing choice).
- [x] 4. UI following `prototype/mockup/`: start screen (headline, optional new/existing choice, suggestions, idea box with counter), result (original idea, editable prompt, copy, new version, start over), copied, generation failure, link not active, usage limit. Light and dark, 375 px to 1280 px. The new/existing choice is a radio group (or toggle buttons), not links. Load all three fonts (the mockup only ships Instrument Serif). Informative text meets 4.5:1 contrast: use the mockup's darker `--ink-3`.
- [x] 5. Best-effort in-memory per-class limit + Netlify per-IP rate limit + prepaid balance as the spending ceiling, as in the approved proposal (CA-05 limit message keeps the idea).
- [x] 6. Update the PRD direction-check rows and `docs/HANDOFF.md`.

## Review stop

- [ ] Before marking this mission's PR ready: show the acceptance evidence, check/eval results, security review, working Preview and what was not verified. The owner decides whether it is ready and applies any owner-only labels. This is the mission's single planned review stop; AGENTS.md emergency stops still apply.

## Acceptance

The mission is done when **all** of these items have evidence:

| Criterion | Expected evidence |
|---|---|
| INV-003 to INV-006 have their invariant tests, passing | `npm run test:invariants`; owner applies `invariant-approved` |
| CA-01, CA-07 | `tests/unit/generate-prompt.test.ts` passing |
| CA-02: suite `generate-prompt` at or above its thresholds with the chosen model | evals table in the PR (`evals` check) |
| CA-03 to CA-06 work in the running app | Preview link + short screen recording or screenshots; automated in mission 0003 |
| CA-08 matches the mockup at 375 px and 1280 px, light and dark | screenshots side by side with `prototype/mockup/` |
| `npm run check` green | CI log |

## Report

Implementation items 1–6 are complete locally. See the [evidence, criterion table, security review, screenshots, mutation table and owner Preview steps](../evidence/0004/README.md). `npm run check` passed with 166 unit tests and 16 invariant tests. The mock suite passed all 20 cases; no new real-model call or key use occurred. Four new invariant files detected five deliberate violations in a disposable copy.

Browser flows and both themes were verified at 375, 768 and 1280 px. The PR includes 32 captures at 375 and 1280 px; the two intermediate captures remain local. No existing test, demo file, AI source, CI configuration, e2e isolation or eval threshold changed. Vite 8.3.5 is the only new direct dependency.

The owner's decision on 2026-10-28 is that the Preview uses the existing TEST key; the owner configures it, and the agent never reads or copies it. Keep one mission and one PR, with at most 140,000 characters measured by the reviewer's filtering and counting logic. Raw command logs are not committed; the CI log provides persistent check evidence.

Stop before Ready: the hosted Preview, account configuration, `invariant-approved` and the owner's decision remain pending. Automatic review has not been triggered. No merge, release, tag or deployment was performed. The queue remains mission 0004 → mission 0003 items 2–4 → mission 0001.
