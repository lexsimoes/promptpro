# promptPRO: generating a prompt (end-to-end plan)

## Owner scope change — 2026-10-28

Mission 0005 supersedes the class-access scenarios below: public `/`, no code, 10 generation attempts per IP per hour. This document preserves the original plan as history; no existing e2e test or isolation file was edited. Before mission 0003 implementation, its author must replace scenarios 1.1/1.2 and 4.2 with public entry and exhaustion after ten attempts, check that the eleventh preserves the idea, and isolate quotas between tests through fresh mock server processes (never a public reset endpoint). A trusted test server supplies loopback identity; do not trust browser-provided forwarding headers. `turma-e2e-limite` no longer controls the running public UI. Other generation/edit/copy/regeneration requirements still apply. The original class helpers remain solely for existing isolated unit fixtures.

## Application Overview

End-to-end plan for promptPRO's main flow, written before mission 0002's code (mission 0003, item 1) from `specs/PRD.md` and the approved mockup `prototype/mockup/`. The tests are written after mission 0002 is merged, by an agent other than the one that wrote the code (mission 0003, item 2).

Tests go in `e2e/`, import `test` and `expect` from `e2e/fixtures.ts` (never from `@playwright/test`) and use `e2e/seed.spec.ts` as seed. The fixture aborts any request outside the app origin; no step may leave it. The app runs in its isolated end-to-end mode (`APP_ENV=e2e`, `LLM_PROVIDER=mock`): no real model is ever called.

Scope: CA-01, CA-03, CA-04, CA-05, CA-06 and CA-07 as seen through the UI, plus the parts of INV-003 and INV-005 a browser can observe. Out of scope here: prompt quality (CA-02, `npm run eval`), the server-side rules of INV-003 to INV-006 (`tests/invariants/`), and the visual comparison of CA-08 (manual). Copy text and accessible names follow the mockup; mission 0002 may adjust wording, and the test agents then update selectors only (`AGENTS.md` 1.3).

## What mission 0002 must provide for these tests

These are requirements on mission 0002, because a test cannot observe them otherwise. Wiring them into `playwright.config.ts` or `e2e/fixtures.ts` is done in mission 0003 with the owner's `test-approved`.

1. **Isolated mode.** With `APP_ENV=e2e` the server accepts only `LLM_PROVIDER=mock` and refuses to start with a real provider (same contract as the demo's `providerFor`, in promptPRO's own file and test).
2. **Class codes in the e2e environment** (set by the e2e server config, never in client code):
   - `turma-e2e`: valid until 2099-12-31;
   - `turma-vencida`: expired on 2020-01-01;
   - `turma-e2e-limite`: valid until 2099-12-31, usage limit of 1 generation per server process.
3. **Class link.** A function or documented format that turns a code into the class link (for example `/#t=<code>`), decided in mission 0002's technical proposal. Below, "the link of `X`" means that format.
4. **Deterministic mock generator.** For an idea `I` and an optional choice `C`, the mock returns a prompt with the six section headings in this order: `Objetivo`, `Contexto`, `Requisitos`, `Restrições`, `Critérios de conclusão`, `A esclarecer`; the first 40 characters of `I` under `Objetivo`; under `Contexto` the line `Projeto novo.` or `Projeto existente.` only when `C` was chosen; and the line `Versão N` (N = 1, 2, … per idea and server process) so two versions differ.
5. **Provider failure on demand.** The mock throws a provider error when the idea contains `E2E-FALHA-PROVEDOR`.
6. **Accessible names** as in the mockup: textbox `Sua ideia`, button `Gerar prompt`, radio buttons `Novo projeto` / `Projeto existente` in a group (not links), textbox `Prompt (editável)`, buttons `Copiar prompt` and `Gerar nova versão`, link `Começar outra ideia`, heading `Este link não está ativo`.

## Test Scenarios

### 1. Access by class link (CA-06, INV-003 as seen in the browser)

**Seed:** `e2e/seed.spec.ts`

#### 1.1. CA-06: a valid class link opens the start screen

**File:** `e2e/access.spec.ts`

**Steps:**
  1. Open the link of `turma-e2e`.
    - expect: The main heading contains `organize` (the stepped headline)
    - expect: Textbox `Sua ideia` is visible and editable; button `Gerar prompt` is present
    - expect: No `Este link não está ativo` heading

#### 1.2. CA-06: without a code, with an unknown code or with an expired code, nothing can be generated

**File:** `e2e/access.spec.ts`

**Steps:**
  1. Open `/` with no code.
    - expect: Heading `Este link não está ativo` and the text asking for the class's updated link
    - expect: No textbox `Sua ideia` and no button `Gerar prompt`
  2. Repeat with the link of `turma-x` (unknown), of `turma-vencida` (expired), of ` turma-e2e ` (spaces around) and of `TURMA-E2E` (other case).
    - expect: The same "link not active" screen each time
  3. For each case above, record the requests the page makes.
    - expect: No request to the generation endpoint returns a generated prompt (a request may be refused; none may succeed)

### 2. Generating a prompt (CA-01, CA-07)

**Seed:** `e2e/seed.spec.ts`

#### 2.1. CA-01: an idea becomes a prompt with the six sections

**File:** `e2e/generate-prompt.spec.ts`

**Steps:**
  1. Open the link of `turma-e2e`. Fill `Sua ideia` with `Quero um site para a minha pista de kart em Campinas com horários e preços.` and click `Gerar prompt`.
    - expect: The original idea is shown, unchanged
    - expect: Textbox `Prompt (editável)` contains, in order, the headings `Objetivo`, `Contexto`, `Requisitos`, `Restrições`, `Critérios de conclusão`, `A esclarecer`
    - expect: The text under `Objetivo` contains `Quero um site para a minha pista de kart`
    - expect: The page URL does not contain any part of the idea (the idea never travels in the URL)
  2. Open the link again, click the suggestion `Site para uma pista de kart em Campinas`.
    - expect: `Sua ideia` is filled with a non-empty text and `Gerar prompt` is enabled
  3. Open the link again with an empty idea, then with only spaces.
    - expect: `Gerar prompt` is disabled, or clicking it shows a message asking for the idea; no prompt is generated
  4. Fill 2,001 characters.
    - expect: The field keeps 2,000 and the counter reads `2.000 / 2.000 caracteres` (the server's refusal above the limit is INV-006, in `tests/invariants/`)

#### 2.2. CA-07: the optional New / Existing choice reaches the prompt's context

**File:** `e2e/generate-prompt.spec.ts`

**Steps:**
  1. Open the link of `turma-e2e`, choose radio `Projeto existente`, fill an idea and generate.
    - expect: Under `Contexto` the prompt contains `Projeto existente.`
  2. Start over, choose `Novo projeto`, generate.
    - expect: Under `Contexto` the prompt contains `Projeto novo.`
  3. Start over without choosing, generate.
    - expect: The prompt contains neither `Projeto novo.` nor `Projeto existente.`

### 3. Editing, copying and new versions (CA-03, CA-04)

**Seed:** `e2e/seed.spec.ts`

#### 3.1. CA-03: copy copies the edited prompt

**File:** `e2e/generate-prompt.spec.ts`

**Steps:**
  1. Grant the page clipboard read and write permission (`context.grantPermissions`), open the link of `turma-e2e`, generate a prompt from any idea.
  2. In `Prompt (editável)`, append a new line `EDITADO-E2E: só pelo WhatsApp.` and click `Copiar prompt`.
    - expect: A status reads that the prompt was copied with the edits
    - expect: The clipboard text equals the textbox value exactly, including `EDITADO-E2E: só pelo WhatsApp.`
  3. Delete everything in the textbox and type `Prompt reescrito à mão.`, then copy again.
    - expect: The clipboard text is exactly `Prompt reescrito à mão.`

#### 3.2. CA-04: a new version comes from the same original idea

**File:** `e2e/generate-prompt.spec.ts`

**Steps:**
  1. Open the link of `turma-e2e`, generate from an idea; note the prompt (it contains `Versão 1`). Append `EDITADO-E2E` to the prompt.
  2. Click `Gerar nova versão`.
    - expect: No confirmation is asked (owner's decision, 2026-10-27): the edited prompt is replaced
    - expect: The prompt now contains `Versão 2`, differs from the first one and no longer contains `EDITADO-E2E`
    - expect: The original idea shown on the page is unchanged
    - expect: Under `Objetivo` the new prompt still starts from the same idea
  3. Click `Começar outra ideia`.
    - expect: The start screen, with an empty `Sua ideia`

### 4. Failures keep the idea (CA-05)

**Seed:** `e2e/seed.spec.ts`

#### 4.1. CA-05: a provider failure keeps the idea and allows a retry

**File:** `e2e/generate-prompt.spec.ts`

**Steps:**
  1. Open the link of `turma-e2e`, fill `Sua ideia` with `App de hábitos E2E-FALHA-PROVEDOR com lembretes diários` and click `Gerar prompt`.
    - expect: An alert in plain language says the prompt could not be generated and that the idea is still there (no stack trace, error code or provider name)
    - expect: `Sua ideia` still contains exactly the text typed
  2. Remove `E2E-FALHA-PROVEDOR` from the idea and retry.
    - expect: The prompt is generated and the alert is gone

#### 4.2. CA-05: the class usage limit keeps the idea

**File:** `e2e/generate-prompt.spec.ts`

**Steps:**
  1. Open the link of `turma-e2e-limite` and generate once from any idea.
    - expect: The prompt is generated
  2. Start over, fill `Sua ideia` with `Segunda ideia da turma limitada` and generate.
    - expect: An alert says the class reached its limit for now and that the idea is still there
    - expect: `Sua ideia` still contains `Segunda ideia da turma limitada`

### 5. Small screens (part of CA-08)

**Seed:** `e2e/seed.spec.ts`

#### 5.1. The main flow works at 375 px

**File:** `e2e/generate-prompt.spec.ts`

**Steps:**
  1. With a 375 × 812 viewport, run steps 1–2 of 2.1 and step 2 of 3.1.
    - expect: Every control used is visible and clickable without horizontal page scroll (document scroll width ≤ viewport width)

## Known gaps

- Prompt quality (no invented features or technologies, ambiguities caught) is CA-02 and belongs to `npm run eval`; the mock only proves the plumbing.
- INV-004 (secrets stay on the server), INV-005 (no student text in logs) and INV-006 (caps) are checked server-side in `tests/invariants/`; the browser can only check that the idea never appears in the URL (2.1) and that no generation succeeds without a valid code (1.2).
- The usage limit per IP is a hosting setting (mission 0002, item 2) and may not be reproducible in the e2e server; only the per-class limit is tested here.
- Clipboard assertions run in Chromium, the only browser in `playwright.config.ts`.
- CA-08's visual match with the mockup (fonts, colors, light/dark, contrast) stays a manual check.
