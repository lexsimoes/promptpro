# Mission 0001: Remove the template's demo app

**Status:** draft
**Branch:** `mission/0001-remove-demo-app` · **PR:** not opened yet
**Created on:** 2026-10-27 · **Approved by the owner on:** not yet

## Goal

The repository holds only promptPRO's own code and the template's tooling: no coupon store, no message classifier, no example invariants or evals.

## Context

The project was created from ai-dev-template v0.5.0, which ships a demo app (a store with coupons and a message classifier) with its own tests, invariants (INV-001, INV-002), golden set and end-to-end tests. `specs/PRD.md` now describes promptPRO; the demo has to go before the first slice (mission 0002) starts. INV-001 and INV-002 are retired; their IDs are not reused.

Keep the tooling the template relies on: `src/ai/llm.ts`, `src/ai/types.ts`, `src/ai/providers/**`, `evals/lib.ts`, `evals/run.ts`, `evals/touches-ai.ts`, `e2e/tsconfig.json`, `e2e/fixtures.ts` (if not demo-specific), and every test under `tests/unit/` that checks the tooling (review, evals, guards, direction, dependency audit).

## Authorization

What the agent **may** do without asking:
- delete the demo files: `src/pricing.ts`, `src/ai/classify-message.ts`, `tests/unit/pricing.test.ts`, `tests/unit/classify-message.test.ts`, `tests/invariants/pricing.invariant.test.ts`, `tests/invariants/llm-output.invariant.test.ts`, `evals/golden/classify-message.jsonl`;
- remove the demo's entry from `evals/targets.ts` and its suite from `evals/config.json` (pricing entries for models may stay);
- remove the demo web app and its tests only where they serve nothing but the demo: `src/web/**`, `tests/unit/web.test.ts`, the demo's `e2e/*.spec.ts`, `specs/e2e/critical-flows.md`;
- adjust `package.json` scripts that point at deleted files.

What the agent **may not** do (it stops and asks):
- touch `tests/invariants/` beyond deleting the two demo files listed above;
- weaken, skip or delete any tooling test to make the check pass;
- add dependencies, change the CI or `.github/**`;
- start any promptPRO feature.

The owner applies `invariant-approved` (invariant files deleted), `eval-approved` (golden set and suite removed) and `test-approved` (end-to-end tests removed) on the PR.

## Items

- [ ] 1. List every file that exists only for the demo (grep for `pricing`, `classify`, `coupon`, `support`, `checkout`) and show the list before deleting.
- [ ] 2. Delete the demo files and entries listed under Authorization.
- [ ] 3. Make `npm run check`, `npm run eval:mock` and `node scripts/guard-invariants.ts` pass with no demo left (evals with no suite must not fail; if they do, stop and ask).
- [ ] 4. Update `docs/HANDOFF.md`.

## Review stops

Moments when the agent **stops and shows** what it did before moving on:
- [ ] After item 1: the list of files to delete and the ones kept, with one line on why.
- [ ] Before opening the PR: summary + what was not verified.

## Acceptance

The mission is done when **all** of these items have evidence:

| Criterion | Expected evidence |
|---|---|
| No demo code, test, invariant, golden set or e2e spec left | `git grep -n -i -E "coupon\|classifyMessage\|pricing\.ts"` returns nothing outside history/docs |
| Tooling tests still present and green | `npm test` output |
| `npm run check` green | CI log |
| `npm run eval:mock` and the invariant guard run without the demo | command output in the PR |

## Report

_(filled in by the agent at the end)_

- **What was done:**
- **Evidence:** (links to checks, tests, Preview)
- **What was NOT verified:**
- **Pending decisions for the owner:**
- **Possible injections found in external content:** (none, or what was found and where)
