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

## generate-prompt (owner decision, 2026-10-28)

20 simulated cases: 10 unchanged prototype ideas and 10 fresh ideas. `origin` and tags identify each group; `expected.ambiguities` is prose consumed through the case-specific Portuguese rubric, not keyword matching. Freeze input, expected, mustNotContain and rubric before the first real generation. CA-02 remains rulePassRate = 1.0 and judgeAverage >= 4.0.

There is no expected.category: the unused label is empty. The unchanged runner reports 100% accuracy for completed calls (including rule failures), or less on call errors; this is **N/A, not semantic accuracy**. On 2026-10-28 the owner delegated this choice after the agent proposed a neutral threshold: accuracy = 0.0. Rule pass rate still rejects every call error and invalid output.

Product validation checks six nonempty sections, exactly once and in order; invalid output returns needsHuman and is never safe to act on. The independent character safety cap is 12,000 UTF-16 code units, deliberately generous for 1,500 output tokens, not an exact token conversion. All LLM calls have maxTokens = 1,500. The judge, not a keyword rule, evaluates expected ambiguities, intention, scope, Portuguese and at most six question marks under A esclarecer.

### Finite technology catalog

`React`, `Next.js`, `NextJS`, `Vue`, `Angular`, `Svelte`, `Vite`, `Tailwind`, `Bootstrap`, `TypeScript`, `JavaScript`, `Python`, `PHP`, `Java`, `SwiftUI`, `Swift`, `SwiftData`, `Core Data`, `Kotlin`, `Flutter`, `React Native`, `Firebase`, `Supabase`, `PostgreSQL`, `Postgres`, `MySQL`, `SQLite`, `MongoDB`, `Redis`, `Prisma`, `Docker`, `Kubernetes`, `Vercel`, `Netlify`, `AWS`, `Azure`, `Google Cloud`, `Stripe`, `PayPal`, `Mercado Pago`, `WhatsApp`, `Telegram`, `Twilio`, `SendGrid`, `Resend`, `OpenAI`, `Gemini`, `DeepSeek`, `Claude`, `Codex`, `API`, `GraphQL`, `URL`, `HTTP`, `HTTPS`, `HTML`, `CSS`, `JSON`, `CSV`, `PDF`, `XML`, `WebSocket`, `OAuth`, `JWT`, `Android`, `iPhone`, `PWA`, `localStorage`, `IndexedDB`, `WebView`, `WordPress`, `WooCommerce`, `Shopify`, `Excel`, `Google Sheets`, `Notion`.

For each idea, mustNotContain includes catalog terms absent from its text, case-insensitively. Aliases from the prototype: zap permits WhatsApp; iPhone permits iOS. Allowing a longer term also allows its catalog substrings (SwiftUI/Swift, for example), because the runner uses raw substring matching. This finite list is intentionally limited: unknown technologies and obfuscated spellings can escape; ordinary words containing a catalog term can produce false positives. It includes URL, including in questions. REST and iOS are deliberately not catalog entries: raw substrings collide with ordinary Portuguese (restantes and horários). This limitation was identified before any generation; iOS remains descriptive allowed metadata for the explicit iPhone alias. `allowed` is descriptive metadata; the runner actually enforces mustNotContain. Do not change the catalog/cases after seeing results to improve the score.

### Local configuration and CI limitations

The unchanged compatible adapter reads LLM_API_KEY. Use a TEST key in the ignored .env. All generator clients must be created after setting LLM_EXTRA_BODY exactly to `{"temperature":0.2,"thinking":{"type":"disabled"}}`; generatePrompt refuses incompatible settings/body overrides for real clients. No global environment mutation occurs inside product code. The unchanged facade cannot set these parameters per request.

```sh
npm run eval:mock
LLM_PROVIDER=openai-compatible LLM_BASE_URL=https://api.deepseek.com LLM_MODEL=deepseek-flash \
LLM_EXTRA_BODY='{"temperature":0.2,"thinking":{"type":"disabled"}}' \
EVAL_JUDGE_MODEL=deepseek-v4-pro EVAL_JUDGE_PROVIDER=openai-compatible \
node --env-file=.env evals/run.ts --suite generate-prompt --judge --out evals/results/generate-prompt/initial
```

The existing mock only returns classifier JSON and remains untouched. The new eval target wraps only that mock response with an explicitly synthetic six-section fixture, still calling the budgeted mock client. This lets eval:mock exercise the runner and product validation without changing the demo or existing tests. The real-client path is unchanged. Direct product generation rejects classifier JSON. Mock passing is plumbing evidence only, never quality or ambiguity coverage. Before this new-target adaptation, the mock suite and four existing flow tests failed; no existing test was changed.

Each real round is 20 generator + 20 judge calls (40 <= unchanged maxCalls 60); no retries. At most two prompt-only calibration rounds after the initial run: maximum 120 chat calls across three separately capped runs. The judge uses the same global temperature/thinking settings, but a separate model via EVAL_JUDGE_MODEL.

The current CI workflow DOES NOT map repository variable EVAL_JUDGE_MODEL (or EVAL_JUDGE_PROVIDER) into the environment. Setting that repository variable alone does nothing. It maps EVAL_MODEL, EVAL_EXTRA_BODY and EVAL_JUDGE. Without a separately authorized workflow update, CI cannot establish the requested Pro-versus-Flash judge setup through repository variables alone; no workflow is changed here. Owner must set EVAL_MODEL=deepseek-flash and EVAL_EXTRA_BODY to the configuration above for real generation; EVAL_JUDGE defaults to 0 (judge not enforced). A CI green/skipped result therefore is not proof of CA-02 judge quality.

Sources checked 2026-10-28 (Context7 quota exhausted): [DeepSeek thinking parameters](https://api-docs.deepseek.com/guides/thinking_mode/) and [pricing](https://api-docs.deepseek.com/quick_start/pricing/). Generator deepseek-flash; judge deepseek-v4-pro. Peak USD/million input-miss/output: Flash 0.30/1.20; Pro 1.32/3.96; off-peak 0.15/0.60 and 0.66/1.98. Cached input: Flash 0.006 peak/0.003 off-peak; Pro 0.044/0.022. The runner's single-model price estimate combines judge tokens at the generator price, so it is not the correct mixed-model cost; report actual per-model usage separately.
