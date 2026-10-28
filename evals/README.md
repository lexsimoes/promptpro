# evals/: tests for functions that use an LLM

An LLM's reply varies: the same request can come back with different words. So, instead of testing "the output equals X", we measure **how often it is right on a set of known cases**.

## Parts

| File | Role |
|---|---|
| `golden/<suite>.jsonl` | **Golden set**: one case per line, with input, expected answer and criterion for the judge |
| `config.json` | Suites, minimum thresholds, maximum tolerated drop and **call ceiling** |
| `targets.ts` | Links each suite to the app function it measures |
| `run.ts` | The evaluator: runs the cases, applies the rules, calls the judge (optional) and builds the table |
| `results/` | Output of each run (ignored by git) |

## Case format

One case per line:

```json
{"id": "delivery-01", "input": "My order has not arrived", "expected": {"category": "delivery"},
 "mustNotContain": ["coupon"], "rubric": "The summary says the order is late.", "tags": ["injection"]}
```

## How the score is computed

1. **Deterministic rules** (always, at no extra cost):
   - **accuracy**: is the label returned equal to `expected.category`?
   - **rules**: did the output pass validation, respect the maximum length and contain nothing from `mustNotContain`?
2. **LLM judge** (optional, `--judge`): another LLM call gives a score from 1 to 5 following the `rubric`. It measures what a fixed rule cannot (e.g. "is the summary faithful?").
3. The run **fails** if any metric is below the threshold in `config.json`, or if it drops more than `maxDropFromBaseline` against a baseline (`--baseline`, e.g. the results from `main`).

## How to run

```bash
npm run eval:mock                       # no key and no cost: tests only the "plumbing"
LLM_PROVIDER=anthropic npm run eval     # real model (needs ANTHROPIC_API_KEY in the environment)
node evals/run.ts --provider anthropic --judge          # with the LLM judge
node evals/run.ts --provider anthropic --baseline path/to/main
```

Exit codes: `0` passed · `1` below the threshold, dropped, or golden set weakened · `2` went over the call ceiling.

To run with DeepSeek on your machine (key in `.env.local`, filled with `read -s`, as in `docs/WORKFLOW.md`):

```bash
LLM_PROVIDER=openai-compatible LLM_BASE_URL=https://api.deepseek.com LLM_MODEL=deepseek-v4-pro \
LLM_EXTRA_BODY='{"reasoning_effort":"none"}' node --env-file-if-exists=.env.local evals/run.ts
```

## In CI (`.github/workflows/evals.yml`)

Runs on **ready** PRs (not drafts) that touch AI files (`aiPaths` in `config.json`):

1. Runs the PR's golden set with the real model and, just before, the target branch's (`main`), with the **same** model. That is the baseline.
2. Posts the table on the PR, with tokens and estimated cost, in a comment that is updated on each run.
3. **Fails** in any of these cases:
   - some metric below the threshold;
   - a drop larger than `maxDropFromBaseline` against `main`;
   - golden set weakened.

Protections:

- **Thresholds from `main`:** limits, maximum drop, call ceiling and `aiPaths` come from the target branch. A PR cannot loosen its own grade.
- **Protected golden set:** deleting or changing an existing case (including the judge criterion), removing a suite or pointing it to another file fails, unless the owner applies the `eval-approved` label. The list of protected suites comes from `main`. Adding cases is free.
- **Separate key:** secret `EVAL_API_KEY`, from a test project with a spending limit. Never the production key or the reviewer's key.

Repository variables (Settings → Secrets and variables → Actions → Variables), all optional:

| Variable | Default | What for |
|---|---|---|
| `EVAL_PROVIDER` | `openai-compatible` | `openai-compatible`, `anthropic` or `mock` |
| `EVAL_BASE_URL` | `https://api.deepseek.com` | API address (OpenAI format) |
| `EVAL_MODEL` | `deepseek-v4-pro` | Model measured |
| `EVAL_EXTRA_BODY` | `{"reasoning_effort":"none"}` | Extra fields. **Use the same config as the app in production**, or the eval measures something else |
| `EVAL_JUDGE` | `0` | `1` turns on the LLM judge (doubles the calls) |

> Why reasoning is off: DeepSeek "thinks" by default, and the reasoning counts toward the output limit. In a classifier that asks for 1,024 tokens, it can use it all up before answering. If the app uses reasoning in production, adjust `EVAL_EXTRA_BODY` **and** the function's output limit.

> ⚠️ The `mock` provider is a keyword classifier. It **does not measure any real AI**: it only proves that tests, evals and CI work.

## Provider-agnostic

The evaluator only knows the `LLMClient` interface (`src/ai/types.ts`). For another provider, create an adapter in `src/ai/providers/` and register it in `src/ai/llm.ts`. The golden set and the rules do not change.

Variables: `LLM_PROVIDER`, `LLM_MODEL`, `EVAL_JUDGE_PROVIDER`, `EVAL_JUDGE_MODEL`, `EVAL_MAX_CALLS`.

## Costs

- Calls per run = cases × (1 + 1 if there is a judge). Today: 10 cases → 10 calls (20 with the judge). The default ceiling is 60.
- Always use the key of a **test project** with a spending limit set at the provider, never the production key.
- In CI, each run runs the golden set **twice** (the one from `main`, as the baseline, and the PR's): 20 calls today, 40 with the judge. Each of the two rounds has its own ceiling.
- The evals comment shows the tokens and the estimated cost of each run (prices in `pricing` in `config.json`).
- Locally, the Anthropic adapter uses `claude-opus-5-5` by default ($4 / $20 per million tokens). Changing the model is the owner's decision, and the eval shows whether quality holds.

## Add a new suite

1. Create `golden/<new>.jsonl` with at least 10 cases, including hard cases and injection attempts.
2. Add the function to `targets.ts`.
3. Register the suite in `config.json` with thresholds.
4. Run `npm run eval:mock` to check the format, and then with the real provider.

Existing cases are not edited or deleted to "pass": that is weakening a test (`AGENTS.md`, section 1.3).

## generate-prompt (owner decisions, 2026-10-28)

20 simulated cases: 10 prototype +10 new, marked origin/tags; no real students or untouched holdout. CA-02 rules1.0/judge>=3.5 (provisional until first real class). Cases/bans frozen before runs; only three diversion rubrics later corrected with owner approval. Both calibrations discarded; initial v2 plus one final owner sentence. Post-result disclosures, scores and literal diffs: docs/missions/0002-eval-report.md.

No expected.category: accuracy **N/A**, neutral0.0 delegated by owner; runner displays100% on completed calls, including rule failures. Product validation: six nonempty sections exactly once/in order, invalid=>needsHuman; independent12,000 UTF-16-unit cap (not token conversion), generation maxTokens1500. Judge/rubric evaluates expected.ambiguities by meaning, intention/scope/Portuguese/<=6 questions, not keywords.

### Finite technology catalog

`React`, `Next.js`, `NextJS`, `Vue`, `Angular`, `Svelte`, `Vite`, `Tailwind`, `Bootstrap`, `TypeScript`, `JavaScript`, `Python`, `PHP`, `Java`, `SwiftUI`, `Swift`, `SwiftData`, `Core Data`, `Kotlin`, `Flutter`, `React Native`, `Firebase`, `Supabase`, `PostgreSQL`, `Postgres`, `MySQL`, `SQLite`, `MongoDB`, `Redis`, `Prisma`, `Docker`, `Kubernetes`, `Vercel`, `Netlify`, `AWS`, `Azure`, `Google Cloud`, `Stripe`, `PayPal`, `Mercado Pago`, `WhatsApp`, `Telegram`, `Twilio`, `SendGrid`, `Resend`, `OpenAI`, `Gemini`, `DeepSeek`, `Claude`, `Codex`, `API`, `GraphQL`, `URL`, `HTTP`, `HTTPS`, `HTML`, `CSS`, `JSON`, `CSV`, `PDF`, `XML`, `WebSocket`, `OAuth`, `JWT`, `Android`, `iPhone`, `PWA`, `localStorage`, `IndexedDB`, `WebView`, `WordPress`, `WooCommerce`, `Shopify`, `Excel`, `Google Sheets`, `Notion`.

mustNotContain bans catalog terms absent from the idea, case-insensitively, including URL in questions. Aliases: zap permits WhatsApp; iPhone permits iOS metadata. Longer allowed terms also permit catalog substrings (SwiftUI/Swift). Finite/raw-substring rules miss unknown/obfuscated technologies and may collide with ordinary words. REST/iOS excluded before generation because of restantes/horários collisions. allowed metadata is descriptive, not enforced. Never change catalog/cases after results to improve scores.

### Configuration

TEST key only ignored .env; unchanged facade/adapter. Product requires real client openai-compatible:deepseek-flash and LLM_EXTRA_BODY exactly temperature0.2/thinking disabled, without overrides; create the client after setting it. No global mutation in product code.

```sh
npm run eval:mock
LLM_PROVIDER=openai-compatible LLM_BASE_URL=https://api.deepseek.com LLM_MODEL=deepseek-flash \
LLM_EXTRA_BODY='{"temperature":0.2,"thinking":{"type":"disabled"}}' \
EVAL_JUDGE_MODEL= EVAL_JUDGE_PROVIDER=openai-compatible \
node --env-file=.env evals/run.ts --suite generate-prompt --judge --out evals/results/generate-prompt/example
```

New target alone adapts the classifier-shaped mock into a visibly synthetic six-section fixture, still calls the budgeted mock client. Direct product rejects classifier JSON. No existing mock/test changed; four initial flow failures resolved in new target. Mock pass proves plumbing only.

40 calls/run (20 generator+20 judge), maxCalls60 unchanged, no retries; no paid repeat without authorization. Historical Pro-judge runs differ from final Flash/Flash. CI does not map EVAL_JUDGE_MODEL/PROVIDER; owner-set EVAL_MODEL=deepseek-flash, EVAL_JUDGE=1, EVAL_EXTRA_BODY as above verified read-only. Local blank judge model emulates CI absent override. Same protocol, stochastic scores; no agent workflow/variable change.

Official docs checked2026-10-28 (Context7 quota exhausted): [thinking](https://api-docs.deepseek.com/guides/thinking_mode/), [pricing](https://api-docs.deepseek.com/quick_start/pricing/). USD/million hit/miss/output: Flash peak .006/.30/1.20, off-peak .003/.15/.60; Pro peak .044/1.32/3.96, off-peak .022/.66/1.98. Report uses actual usage, not billing; runner's miss-only/mixed-model estimate differs.
