# Mission 0002: Prompt generator and validation

**Status:** approved · **Created:** 2026-10-27 · **Owner revisions:** 2026-10-28
**Branch:** mission/0002-generate-prompt · **PR:** https://github.com/lexsimoes/promptpro/pull/6

## Context

Deliver original items 1–3 only. Read PRD, HANDOFF, [technical proposal](0002-technical-proposal.md) and [eval report](0002-eval-report.md). Former items 4–9 move to [0004](0004-generate-endpoint-and-ui.md), preserving authorization/prohibitions/acceptance. Queue: 0004 → 0003 items 2–4 → 0001. Demo remains working.

DeepSeek V4 Flash, chosen by the owner on 2026-10-28; prototype validates. ID deepseek-flash, temperature0.2/thinking off/cap1500, existing facade only. Initialv2 +exact final owner sentence; discarded calibrations/report-only diffs. CA-02 rules1/judge>=3.5 provisional until first real class, accuracy N/A/neutral0 delegated. Three owner-approved post-result diversion-rubric corrections only; other cases/bans unchanged. CI/local both Flash, owner variables read-only verified.

## Authorization and prohibitions

Authorized: prototype, generator/validator, new unit-test file, new golden suite/target/config/README, approved PRD CA-02 update, mission/report/HANDOFF. Owner specifically authorized rubric/threshold corrections and the final sentence/run. Technical decisions are in the approved proposal, inherited by 0004; no infrastructure provisioned.

No template runner/library or facade edits; no demo/existing tests/invariants/e2e fixtures/Playwright/.github/dependency changes. No endpoint/UI, storage/accounts/DNS/deploy, merge/tag/release or owner labels. No further calibration or paid repeat; global emergency stops remain.

## Items and review stops

- [x] 1. Throwaway prototype: ten simulated ideas twice, reports/versions retained; owner closed despite failures on 2026-10-28.
- [x] 2. Technical proposal approved by owner on 2026-10-28; no implementation/provisioning.
- [x] 3. Reusable generation and six-section validation, new target, 20 simulated golden cases (10 prototype +10 new), finite technology bans including URL; judge evaluates ambiguities/scope/Portuguese/<=6 questions. Final gate passes: rules20/20, judge3.95 (prototype4.00/new3.90), 40 calls, no failures/retries; estimated USD .008408772.

Owner approved the simplified plan and final sentence conditionally on that gate, expressly requested Ready and automatic-review handling. Earlier item stops satisfied; never merge. Further product acceptance/invariants/UI remain entirely in 0004.

## Acceptance / report

Evidence: prototype/proposal, eight new unit tests, per-case eval report, fresh check155 unit/8 invariants. PR #6 records diff<150,000/secret scan/review. CI stochastic scores may vary. Raw records ignored/local evals/results/generate-prompt/owner-behavior-only/; key only ignored .env.

Not verified: human semantic review, real class, untouched holdout, production privacy/access/limits, hosted Preview, retention, actual billing. Review the provisional threshold after the first real class.
