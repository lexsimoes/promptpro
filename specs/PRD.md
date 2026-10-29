# PRD: promptPRO

> PRD = product requirements document. Short on purpose: if it goes past 2 pages, cut.

**Owner:** @lexsimoes · **Last review:** 2026-10-28

## 1. Goal

Help students of the owner's vibe-coding course turn an idea written in their own words into a structured prompt (objective, context, requirements, constraints, completion criteria, open questions) ready to paste into Claude Code, Codex or another coding agent, without inventing features or technologies. Access is for course students only, by a class link, with no accounts and no database.

## 2. Users

| Who | What they need |
|---|---|
| Course student (vibe-coding beginner) | A prompt that keeps what they meant, organized so an agent can act on it, and that shows what they still need to decide |
| Course owner (@lexsimoes) | Give each class access with one link, cap the cost, and turn off a leaked link without touching the app |

## 3. Acceptance criteria

Each criterion must be **verifiable**: someone (or a test) can say yes or no.

| ID | Criterion | How to verify |
|---|---|---|
| CA-01 | When a student describes an idea and clicks generate, they get a prompt in Portuguese with the sections Objective, Context, Requirements, Constraints, Completion criteria and To clarify | `tests/unit/generate-prompt.test.ts`; `e2e/generate-prompt.spec.ts` |
| CA-02 | The prompt keeps the student's intent: it adds no feature or technology the idea did not ask for, and lists what the idea leaves undecided under To clarify. Measured by evals, not guaranteed: suite `generate-prompt` with rule pass rate = 1.0 and judge average ≥ 3.5 on the golden set (owner decision, 2026-10-28; review this provisional threshold after the first class with real student ideas) | `npm run eval` (suite `generate-prompt`) |
| CA-03 | When the student edits the generated prompt, the copy button copies the edited text | `e2e/generate-prompt.spec.ts` |
| CA-04 | "Generate a new version" produces another prompt from the same original idea, which stays visible | `e2e/generate-prompt.spec.ts` |
| CA-05 | When generation fails (provider error or usage limit), the idea stays in the field and the student can try again | `e2e/generate-prompt.spec.ts` |
| CA-06 | Opening the app without a valid class code (missing, unknown or expired) shows "this link is not active" and nothing can be generated | `tests/invariants/access.invariant.test.ts`; `e2e/access.spec.ts` |
| CA-07 | The optional "New project / Existing project" choice is reflected in the prompt's Context; with no choice, the prompt does not assume either | `tests/unit/generate-prompt.test.ts` |
| CA-08 | The UI follows the approved mockup (`prototype/mockup/`): Ideal Match tokens and fonts (Instrument Serif, Instrument Sans, JetBrains Mono; the mockup ships only the serif), Portuguese copy, usable at 375 px width, light and dark; informative text has at least 4.5:1 contrast (WCAG AA), so `--ink-3` uses the mockup's darker values | Manual: compare each screen with `prototype/mockup/` at 375 px and 1280 px, and measure the contrast of labels, counter and hints |

## 4. Non-negotiables

Rules that can **never** break. Each one has a test in `tests/invariants/` that no agent may edit, skip or weaken. CI requires these tests to pass. (INV-001 and INV-002 belonged to the template's demo app; their IDs are not reused.)

| ID | Rule | Test |
|---|---|---|
| INV-003 | The model is never called unless the request carries a valid, unexpired class code, checked on the server | `tests/invariants/access.invariant.test.ts` |
| INV-004 | The model API key and the class codes stay on the server: never in client code, a response body or a forwarded error | `tests/invariants/server-secrets.invariant.test.ts` |
| INV-005 | The student's text (idea and edited prompt) is never persisted nor written to the application's logs | `tests/invariants/student-content.invariant.test.ts` |
| INV-006 | Every model call has a capped input and a capped output; an idea over the limit is rejected before any call | `tests/invariants/model-limits.invariant.test.ts` |

### INV-003 cases
- No code in the request → refused (401), model mock records 0 calls.
- Unknown code `turma-x` → refused (403), 0 calls.
- Code valid until 2026-12-31T23:59:59-03:00: at 23:59:58 → allowed, 1 call; at 2027-01-01T00:00:00-03:00 → refused, 0 calls.
- Code with a different letter case or surrounding spaces → treated as unknown, 0 calls.
- Catches a violation: move the code check after the model call (or remove it) → the "0 calls" assertions fail.

### INV-004 cases
- Built client assets (everything served to the browser) → contain neither the model key value nor any class code from the test environment.
- Successful generation and every error response (400, 401, 403, 429, 500) → body contains neither the key nor the list of codes.
- Provider error whose message includes the key (`invalid key sk-test-123`) → the student sees a generic error without `sk-test-123`.
- Catches a violation: expose the key through a public env variable, or return the provider's error message as-is → the test finds the value and fails.

### INV-005 cases
- Generation with the idea `SENTINEL-IDEA-7731` → no captured log line contains it, and no file is written.
- Provider throws an error that echoes the idea → logs carry the error type, never `SENTINEL-IDEA-7731`.
- Request refused by the usage limit or the code check → same: no log line with the sentinel.
- Catches a violation: add `console.log(idea)` in the generation path → the test finds the sentinel and fails.

### INV-006 cases
- Idea of exactly 2,000 characters → accepted, 1 call.
- Idea of 2,001 characters, or empty / only spaces → refused (400), 0 calls.
- Every call the model mock receives → has a maximum output tokens value set and ≤ the configured cap.
- Catches a violation: drop the length check or the output cap → the 2,001-character case reaches the mock, or the cap assertion fails.

Outside these tests: how long the AI provider keeps the requests (its data-retention policy) must be checked separately before launch (`docs/HANDOFF.md`, pending decisions).

## 5. Out of scope

- Individual accounts, logins, passwords and a database.
- Prompt history.
- Payments.
- Running the generated prompt, or any agent, from the app.
- Choosing the technology for the student automatically.
- An English version.
- Choosing the platform (site / web app / iOS app) in the first version.
- Opening the app to the general public.
- Treating evals as a guarantee: they measure the model on known cases; a generative model can still err.

## 6. Direction check

Updated on every mission, by the agent, in the mission's PR. Every Monday, the `Direction check` workflow opens an issue that checks this table (do the files cited as evidence exist?) and asks for your review. It shows whether what exists today meets what was asked for.

| Requirement | Evidence | Status |
|---|---|---|
| CA-01 | `tests/unit/generate-prompt.test.ts` (local; hosted Preview pending) | ✅ |
| CA-02 | `docs/missions/0002-eval-report.md` (local; hosted Preview pending) | 🟡 |
| CA-03 | `docs/evidence/0004/README.md` (local; hosted Preview pending) | ✅ |
| CA-04 | `docs/evidence/0004/README.md` (local; hosted Preview pending) | ✅ |
| CA-05 | `docs/evidence/0004/README.md` (local; hosted Preview pending) | ✅ |
| CA-06 | `tests/invariants/access.invariant.test.ts` (local; hosted Preview pending) | ✅ |
| CA-07 | `tests/unit/promptpro-server.test.ts` (local; hosted Preview pending) | ✅ |
| CA-08 | `docs/evidence/0004/README.md` (local; hosted Preview pending) | ✅ |
| INV-003 | `tests/invariants/access.invariant.test.ts` (local; hosted Preview pending) | ✅ |
| INV-004 | `tests/invariants/server-secrets.invariant.test.ts` (local; hosted Preview pending) | ✅ |
| INV-005 | `tests/invariants/student-content.invariant.test.ts` (local; hosted Preview pending) | ✅ |
| INV-006 | `tests/invariants/model-limits.invariant.test.ts` (local; hosted Preview pending) | ✅ |

Legend: ✅ done and verified · 🟡 partial · ⬜ not started · ❌ broken
