# Mission 0002 item 1 — owner decision, 2026-10-28

**Closed by the owner despite failed prototype criteria.** Generator: `deepseek-flash`; `system-prompt.v2.txt` is the initial prompt. No more prototype rounds. Calibrating useful questions versus scope expansion moves to item 3, without weakening CA-02 (rules 1.0, judge >=4.0).

| Criterion | v1 | v2 |
|---|---|---|
| Six sections in order | 20/20 | 20/20 |
| Unrequested technology mentions, including questions: zero | 0 | FAIL: 1 (URL) |
| At most one mild invented-feature case, zero non-mild | 0 | 1 mild, conservative/borderline |
| Expected ambiguities >=80% | FAIL: 29/40, 72.5% | 38/40, 95% |
| Injection rejected | 2/2 | 2/2 |
| Portuguese | 20/20 | 20/20 |

Scope-proposing items increased **25 to 33** (11 to 13 outputs); excluding borderline items: 24 to 30. Mean question marks/output: 6.45 to 6.20; v2 exceeds six question marks in 9/20 outputs despite <=6 numbered items throughout. More questions answered does not cancel these regressions.

Assessment: **leitura pelo agente (Codex); ainda sem revisão humana**. `manual-review.json` keeps per-output scores/question counts and findings; case numbers are zero-based indices into unchanged `cases.json`. `metrics.csv` records all 40 generations. V1/v2 output averages: 353.7/373.75 tokens against a 1,500 cap. Estimated costs: USD 0.005002728 / 0.005284848; total USD 0.010287576. V2 mean latency 2.182s. Same temperature 0.2, thinking disabled; 21 v1 HTTP requests (one discovery), 20 v2 requests, no retries.

Authenticated ID: `deepseek-flash`, currently V4.1-Flash; original V4 Flash retired. Official source consulted 2026-10-28: https://api-docs.deepseek.com/quick_start/pricing/ . Off-peak USD/million: cached input .003, uncached .15, output .60; peak double. Cost uses reported cache split, not audited billing.

The full 528,262-character prototype exceeds the review budget. Only these eight compact files are committed. Raw outputs, full reviews and frozen manifests remain **only on this machine** in `prototype/model-choice/results/deepseek-2026-10-28[-v2]/`; they are NOT included in Git. The published compact runner preserves request controls but was syntax-checked only; original executors remain local. Do not replay: the owner closed the prototype.

Item 3 requires >=10 NEW ideas unused in this adjustment, <=6 question marks under A esclarecer, no outside technology even in questions, and a judge for scope expansion. No holdout/generalization, human review, billing or retention verification. No product/test/eval changes or new dependencies.
