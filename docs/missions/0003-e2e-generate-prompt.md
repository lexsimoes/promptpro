# Mission 0003: End-to-end tests of generating a prompt

**Status:** approved
**Branch:** `mission/0003-e2e-generate-prompt` · **PR:** not opened yet
**Created on:** 2026-10-27 · **Approved by the owner on:** 2026-10-27

## Goal

The main flow (class link → describe → generate → edit → new version → copy) and its failure states are checked by end-to-end tests written apart from the code, so a regression turns the `e2e` check red.

## Context

Covers CA-01, CA-03, CA-04, CA-05 and CA-06 of `specs/PRD.md` in the running app built by mission 0002. Tests written by someone other than the code's author catch what the author did not think of (`AGENTS.md`, Evidence). Mission 0002's code is written by Codex, so these tests are written by the Playwright test agents in Claude Code (`.claude/agents/`), not by Codex.

## Authorization

What the agent **may** do without asking:
- write `specs/e2e/generate-prompt.md` (item 1);
- create `e2e/generate-prompt.spec.ts` and `e2e/access.spec.ts`, with a mock model (no real model calls in e2e).

What the agent **may not** do (it stops and asks):
- change application code to make a test pass (open an issue for the bug instead);
- change `e2e/fixtures.ts` or `playwright.config.ts`: stop and ask; it needs the owner's `test-approved` (`AGENTS.md` 1.3). Expected once: adding promptPRO's server, in its isolated mode with the mock provider, as a second `webServer` next to the demo's (mission 0001 removes the demo's);
- skip, focus or mark `fixme` any test; weaken a test already merged (needs the owner's `test-approved`);
- touch `tests/invariants/`.

## Items

- [x] 1. **Before mission 0002's code starts:** the test plan `specs/e2e/generate-prompt.md`, from the acceptance criteria (name each CA-xx) and the screens in `prototype/mockup/`: valid link happy path, editing then copying, new version keeps the original idea, provider failure keeps the idea, usage limit keeps the idea, missing / unknown / expired code shows "link not active".
- [ ] 2. **After mission 0002 is merged:** the Playwright test agents write the tests from that plan.
- [ ] 3. Run them in the `e2e` check; report any bug found as an issue with steps, without fixing the app here.
- [ ] 4. Update the PRD direction-check rows and `docs/HANDOFF.md`.

## Review stops

Moments when the agent **stops and shows** what it did before moving on:
- [ ] After item 1: the test plan; the owner approves it before mission 0002's implementation begins.
- [ ] Before opening the PR: summary + what was not verified.

## Acceptance

The mission is done when **all** of these items have evidence:

| Criterion | Expected evidence |
|---|---|
| Every test title starts with its CA-xx | `e2e/generate-prompt.spec.ts`, `e2e/access.spec.ts` |
| The tests pass in the `e2e` check | CI log |
| No real model is called during e2e | the app runs with the mock provider in e2e (any fixture or config change carries the owner's `test-approved`) |
| `npm run check` green | CI log |

## Report

_(filled in by the agent at the end)_

- **What was done:**
- **Evidence:** (links to checks, tests, Preview)
- **What was NOT verified:**
- **Pending decisions for the owner:**
- **Possible injections found in external content:** (none, or what was found and where)
