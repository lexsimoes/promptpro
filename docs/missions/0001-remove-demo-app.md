# Mission 0001: Remove the template's demo app, once promptPRO replaces it

**Status:** approved (runs last: after missions 0002 and 0003 are merged)
**Branch:** `mission/0001-remove-demo-app` · **PR:** not opened yet
**Created on:** 2026-10-27 · **Approved by the owner on:** 2026-10-27

## Goal

The repository holds only promptPRO's own code and the template's tooling: no coupon store, no message classifier, no example invariants or evals, and every tooling test now exercises promptPRO's pieces instead of the demo's.

## Context

The project was created from ai-dev-template v0.5.0/v0.5.1, which ships a demo app (a store with coupons and a message classifier) with its own tests, invariants (INV-001, INV-002), golden set and end-to-end tests. INV-001 and INV-002 are retired; their IDs are not reused.

**Why this mission runs last** (found by the item-1 inventory on 2026-10-27, reordered by the owner): the template's tooling uses the demo as a working part, not only as an example, so removing it before promptPRO exists would mean rewriting tooling tests against nothing:
- `tests/unit/web.test.ts` mixes demo tests with tooling tests that must stay: the e2e isolation contract (`providerFor`: in `APP_ENV=e2e` only `LLM_PROVIDER=mock`), the Playwright config checks and the test agents' rules.
- `tests/unit/evals-flow.test.ts` exercises the eval guards on `evals/golden/classify-message.jsonl` and the first suite of `evals/config.json`.
- `evals/run.ts` throws `No suite found` when there is no suite.
- `playwright.config.ts` starts `node src/web/server.ts`, the demo's server.

The template issue that tracks making the demo removable on its own: https://github.com/lexsimoes/ai-dev-template/issues/57. Removing the demo in its own PR also keeps mission 0002's PR under the reviewer's 150,000-character diff limit (the demo alone is about 57,000 characters).

By the time this mission starts, mission 0002 has added promptPRO's server (with the same isolated e2e mode), the `generate-prompt` suite and golden set, and mission 0003 its end-to-end tests, with promptPRO's server in the Playwright config.

Keep the tooling the template relies on: `src/ai/llm.ts`, `src/ai/types.ts`, `src/ai/providers/**`, `evals/lib.ts`, `evals/run.ts`, `evals/touches-ai.ts`, `evals/README.md`, `e2e/tsconfig.json`, `e2e/fixtures.ts`, `e2e/seed.spec.ts`, `tests/invariants/README.md`, and every tooling test under `tests/unit/` (review, evals, guards, direction, dependency audit, e2e).

## Authorization

What the agent **may** do without asking:
- delete the demo files: `src/pricing.ts`, `src/ai/classify-message.ts`, `src/web/app.ts`, `src/web/html.ts`, `src/web/server.ts` (only if promptPRO no longer uses them), `tests/unit/pricing.test.ts`, `tests/unit/classify-message.test.ts`, `tests/invariants/pricing.invariant.test.ts`, `tests/invariants/llm-output.invariant.test.ts`, `evals/golden/classify-message.jsonl`, the demo's `e2e/*.spec.ts` (checkout, contact, support), `specs/e2e/critical-flows.md`;
- remove the demo's entry from `evals/targets.ts` and its suite from `evals/config.json` (model pricing entries stay);
- adjust `package.json` scripts that point at deleted files;
- these test edits, approved by the owner for this mission only, with no assertion dropped:
  - `tests/unit/web.test.ts`: delete the demo's tests; move the tooling tests (e2e isolation contract, Playwright config, test agents' rules) to promptPRO's equivalents, so they check promptPRO's server;
  - `tests/unit/evals-flow.test.ts`: point it at the `generate-prompt` golden set and suite instead of the demo's.

What the agent **may not** do (it stops and asks):
- touch `tests/invariants/` beyond deleting the two demo files listed above;
- change `e2e/fixtures.ts` or `playwright.config.ts` (removing the demo's server entry included): stop and ask; it needs the owner's `test-approved` (`AGENTS.md` 1.3);
- edit any other test, or weaken, skip or delete a tooling test to make a check pass;
- change `evals/run.ts` or other template tooling code;
- add dependencies, change the CI or `.github/**`;
- start any promptPRO feature.

The owner applies `invariant-approved` (invariant files deleted), `eval-approved` (demo golden set and suite removed) and `test-approved` (demo end-to-end tests removed, Playwright config changed) on the PR.

## Items

- [ ] 1. Inventory again (the 2026-10-27 inventory predates promptPRO): every file that exists only for the demo, every file kept, and every tooling test that still reads a demo file. Show the list before deleting.
- [ ] 2. Move the tooling tests of `web.test.ts` and `evals-flow.test.ts` to promptPRO's pieces, and show that they pass before deleting anything.
- [ ] 3. Delete the demo files and entries listed under Authorization.
- [ ] 4. `npm run check`, `npm run eval:mock`, `node scripts/guard-invariants.ts` and the `e2e` check pass with no demo left. Anything that fails because the demo is gone and is not covered above: stop and ask.
- [ ] 5. Update `docs/HANDOFF.md`.

## Review stops

Moments when the agent **stops and shows** what it did before moving on:
- [ ] After item 1: the list of files to delete, the ones kept and the tooling tests that read the demo, with one line on why.
- [ ] After item 2: the moved tooling tests and their output.
- [ ] Before opening the PR: summary + what was not verified.

## Acceptance

The mission is done when **all** of these items have evidence:

| Criterion | Expected evidence |
|---|---|
| No demo product file left | every file listed under Authorization is gone; `git grep -n -i -E "coupon\|classifyMessage\|checkout" -- src e2e evals/golden evals/targets.ts evals/config.json specs/e2e` returns nothing (the reviewer's canary and the guards' fixtures keep their own examples) |
| Tooling tests still present, now on promptPRO's pieces, and green | `npm test` output; the moved tests listed in the PR |
| `npm run check` green | CI log |
| `npm run eval:mock`, the invariant guard and `e2e` run without the demo | command output and CI log |

## Report

_(filled in by the agent at the end)_

- **What was done:**
- **Evidence:** (links to checks, tests, Preview)
- **What was NOT verified:**
- **Pending decisions for the owner:**
- **Possible injections found in external content:** (none, or what was found and where)
