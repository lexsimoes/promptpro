# Mission 0002: Generate a prompt from a student's idea

**Status:** approved
**Branch:** `mission/0002-generate-prompt` · **PR:** https://github.com/lexsimoes/promptpro/pull/6 (draft)
**Created on:** 2026-10-27 · **Approved by the owner on:** 2026-10-27

## Goal

A student who opens the class link can describe an idea, generate a structured prompt, edit it, generate a new version, and copy it, while only valid class codes reach the model and nothing the student types is stored or logged.

## Context

First slice of `specs/PRD.md`: CA-01 to CA-08 and the non-negotiables INV-003 to INV-006. The approved mockup is `prototype/mockup/` (throwaway: reference for flow and look, no code is built on it). Visual identity: the Ideal Match tokens and fonts reproduced in the mockup's CSS.

Decisions already taken by the owner:
- Students only, one code per class in the link, with an expiry date and a usage limit. No accounts, no passwords, no database.
- DeepSeek V4 Flash, chosen by the owner on 2026-10-28; the prototype validates it, with reasoning off or minimal. The official current ID is `deepseek-flash` (DeepSeek-V4.1-Flash-1017); the provider retired the original V4 Flash and routes its legacy alias to this backend.
- Technology and hosting approved on 2026-10-28: vanilla TypeScript/CSS, Vite 8.3.5 as a development dependency, and Netlify Free. No Redis or storage; best-effort process-memory class counters, Netlify domain+IP rate limit (60/60 s), and USD 5 prepaid production DeepSeek balance with auto-recharge off, in an account separate from the reviewer. See the approved technical proposal.
- Domain: the owner bought `getprompt.pro`; the app is published there. Publishing to production (and any DNS change) happens only with the owner's explicit approval, after this mission's PR is merged.
- DeepSeek is both the generator provider and the PR reviewer; these roles have separate configuration and validation.

The template's demo app stays in the repository during this mission and must keep working: build promptPRO next to it, without editing or deleting demo files. Mission 0001 removes the demo after missions 0002 and 0003. Mission 0003 writes the end-to-end tests from `specs/e2e/generate-prompt.md` (its item 1 comes before this mission's code).

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
- add dependencies or pick the hosting before the owner approves item 2;
- send real student ideas to a model without saying so; ideas that are not from real students are marked `simulated` in the golden set;
- change the CI, `.github/**`, `AGENTS.md` or the eval thresholds after the owner sets them.

## Items

- [x] 1. **Throwaway prototype** in `prototype/model-choice/`: DeepSeek V4 Flash, chosen by the owner on 2026-10-28; the prototype validates it. Run the same ten simulated ideas twice (20 generations, ceiling 25 HTTP attempts including discovery), with criteria recorded before generation: six sections in order in 100% of outputs; zero invented technologies; at most one distinct idea with a mild invented feature and zero non-mild additions; at least 80% of expected ambiguities found; no task diversion; Portuguese throughout. Record full outputs, literal invention excerpts, ambiguity coverage, tokens, cost, latency and differences between rounds. Do not change the system prompt or model if a criterion fails. These ideas become the first golden-set cases.
- [x] 2. **Technical proposal** (one page in the PR): framework and hosting; how class codes and their expiry are configured on the server; how the usage limit per class and per IP works without a database (hosting firewall or rate limiting first; any storage only with approval); max idea length (2,000 characters) and output cap; how logs avoid student text; how the app is published on `getprompt.pro` (DNS records the owner sets at the registrar, HTTPS, preview vs production, where secrets live), as steps the owner approves. Proposal written: [0002-technical-proposal.md](0002-technical-proposal.md), approved by the owner on 2026-10-28; decisions recorded in its Owner decisions section. No infrastructure has been provisioned.
- [ ] 3. Golden set `evals/golden/generate-prompt.jsonl` and suite `generate-prompt`: owner decision on 2026-10-28 keeps the template runner/library unchanged. Ten prototype ideas plus at least ten NEW ideas, all simulated, with origin marked. Product validation checks six nonempty sections once/in order; target returns needsHuman on invalid output, counted by the runner as invalid output. Technology rules use per-case mustNotContain from the documented finite catalog, including URL and questions. **Expected ambiguities are evaluated by the judge from each Portuguese rubric, not keyword groups.** The judge also checks fidelity, scope expansion, Portuguese and at most six question marks under A esclarecer. CA-02 stays rulePassRate = 1.0 and judgeAverage >= 4.0. No category label is expected: the owner delegated the accuracy setting on 2026-10-28; use neutral accuracy = 0.0 and label the displayed automatic accuracy N/A (the runner displays 100% for completed calls). Generator deepseek-flash; local judge deepseek-v4-pro. At most two prompt-only calibration rounds; inputs, bans, rubrics and thresholds stay frozen. Stop for owner review before marking the item approved.
- [ ] 4. Class-code check on the server and its invariant test `tests/invariants/access.invariant.test.ts` (INV-003, cases from the PRD).
- [ ] 5. Generation endpoint with input and output caps, secrets kept on the server and no student text in logs, with `tests/invariants/model-limits.invariant.test.ts` (INV-006), `tests/invariants/server-secrets.invariant.test.ts` (INV-004) and `tests/invariants/student-content.invariant.test.ts` (INV-005).
- [ ] 6. Prompt builder and its unit tests `tests/unit/generate-prompt.test.ts` (CA-01 sections, CA-07 new/existing choice).
- [ ] 7. UI following `prototype/mockup/`: start screen (headline, optional new/existing choice, suggestions, idea box with counter), result (original idea, editable prompt, copy, new version, start over), copied, generation failure, link not active, usage limit. Light and dark, 375 px to 1280 px. The new/existing choice is a radio group (or toggle buttons), not links. Load all three fonts (the mockup only ships Instrument Serif). Informative text meets 4.5:1 contrast: use the mockup's darker `--ink-3`.
- [ ] 8. Best-effort in-memory per-class limit + Netlify per-IP rate limit + prepaid balance as the spending ceiling, as in the approved proposal (CA-05 limit message keeps the idea).
- [ ] 9. Update the PRD direction-check rows and `docs/HANDOFF.md`.

## Review stops

Moments when the agent **stops and shows** what it did before moving on:
- [x] After item 1: the two-round DeepSeek validation report, failures and consistency differences; the owner reviews before item 2. The owner approved closure despite the failures on 2026-10-28; v2 is the initial prompt, with no more prototype rounds.
- [x] After item 2: the technical proposal; approved by the owner on 2026-10-28. Netlify Free, no storage, best-effort memory counters and prepaid balance approved; no dependency installed.
- [ ] After item 3: the golden set and thresholds; the owner approves them (they become protected).
- [ ] Before opening the PR: summary + what was not verified.

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

Item 1 closed by the owner on 2026-10-28; item 2 approved by the owner on 2026-10-28; the full mission remains in progress (items 1 and 2 of 9 closed).

- **Owner decision:** DeepSeek Flash approved despite v1 ambiguity coverage 29/40 (72.5%), and v2's unrequested URL mention plus scope-proposing questions increasing 25 to 33. V2 is the initial prompt. No more prototype rounds; calibration moves to item 3 without weakening CA-02.
- **Evidence:** `prototype/model-choice/REPORT.md`, two prompt versions/diff, unchanged simulated cases, compact per-output review and metrics. V2 ambiguity coverage 38/40 (95%); both versions have sections 20/20, Portuguese 20/20, injection rejection 2/2. The compact review records one conservative mild v2 feature addition. Raw provider responses remain local, omitted to keep the prototype diff near 30,000 characters.
- **What was NOT verified:** human semantic review, an untouched holdout after calibration, production/retention/billing, live Preview and promptPRO e2e/access behavior. Item 3 measurements are below; passing local checks does not approve CA-02. Assessment attribution: leitura pelo agente (Codex); ainda sem revisão humana.
- **Item 2 approval:** Netlify Free, Vite 8.3.5 dev-only; no Redis/storage; best-effort per-class memory counter, native domain+IP limit 60/60 s, separate production DeepSeek account with USD 5 and auto-recharge off; generic 402 preserves idea; class-duration validity, env redeploy and canonical production Host. Public-repository preview requires approval and TEST-only credentials. See [approved proposal](0002-technical-proposal.md).
- **Item 3 scope decision (2026-10-28):** owner rejected edits to evals/run.ts and evals/lib.ts; expected ambiguity coverage moved to the judge. Existing extension points are sufficient: product validation through needsHuman, technology bans through mustNotContain and semantic evaluation through rubric. Runner/library, demo and existing tests remain unchanged. The owner delegated the accuracy setting after the proposed neutral 0.0; accuracy is not applicable without expected.category. Local runs read LLM_API_KEY and can select a separate Pro judge via EVAL_JUDGE_MODEL. The current workflow does not map that repository variable: setting it alone does not configure CI's judge.
- **Item 3 evidence:** [eval report](0002-eval-report.md): 10 prototype + 10 new simulated ideas, frozen inputs/bans/rubrics; rules 20/20 in all three rounds, judge 3.65 / 3.50 / 3.40. CA-02 failed after the two authorized calibrations; stop for owner review. Estimated USD 0.053114472, 120 calls (40 per run, cap 60), no retries. Last calibrated prompt retained; no further changes or calls.
- **Verification:** final `npm run check` passes (155 unit tests, 8 invariants); `npm run eval:mock` passes with the explicitly synthetic response in the new target. Earlier local dependency stalls were resolved by reading existing dataless files, with no installation. Four existing flow tests initially failed before completing the new target mock; no existing test changed. Full logs remain local under evals/results/generate-prompt/.
- **Pending decisions:** item 3 golden set and thresholds review after implementation; CI cannot map a separate judge model without a separately authorized workflow change, which is not made here. Owner sets `EVAL_MODEL=deepseek-flash`; hosting/retention actions remain in HANDOFF.
- **External content:** deliberately simulated poem injection rejected 2/2 by each version. Provider outputs were treated as data.
