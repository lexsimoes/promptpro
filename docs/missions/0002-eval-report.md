# Mission 0002 item 3 — eval evidence

**2026-10-28.** [Full historical per-case scores, excerpts, rubrics, token/cost tables and review](https://github.com/lexsimoes/promptpro/blob/1cd1de8/docs/missions/0002-eval-report.md). Raw data ignored/local evals/results/generate-prompt/. Assessment: leitura pelo agente (Codex); ainda sem revisão humana.

Historical Pro-judge runs20/20 rules,3.65/3.50/3.40 failed4.0; calibrations discarded below. Owner then approved v2, three refusal-rubric corrections (expected refusal had scored1), provisional3.5 until first class. Simplified Flash run19/20,3.80 failed URL. After stopping, owner authorized behavior-only sentence; final local20/20,3.95 (prototype4/new3.9),40calls/no retries. Post-result changes, not blind improvement.

CI40728416354 passed; later40729003042 failed19/20, judge3.80: slow-dashboard contains API. No raw artifact was published; exact matching word unknown. No claim that it certainly was a false positive. Same model/settings are stochastic.

## Owner-approved ban correction after CI

Lowercase includes() collides: API in rapidez/rapidamente/terapia/capital/capim/apicultura/apimentar; Vite in evite/convite; Excel in excelente; Redis in redistribuir; Angular in triangular; Prisma is a homograph. Scan220 local result JSONs found no additional Portuguese collision (SwiftUI/Swift is technical). Owner approved variants/context, explicitly accepting limited coverage, on2026-10-28.

119 original bans replaced: API19cases, other five20 each. API/Vite/Excel/Redis/Angular: space+name+space/comma/period/question mark; API also plural APIs. Contexts: usar uma API; com Vite; planilha do Excel; cache Redis; framework Angular. Prisma: Prisma ORM, ORM Prisma, cliente Prisma, Prisma Client, schema Prisma. All other bans and every case/input/expected/rubric/allowed/tag unchanged; no technology removed from the catalog. Runner/library, prompt and thresholds unchanged.

Limits: finite includes variants are not word boundaries. Unlisted punctuation/newlines/markup, isolated start/end names, inflections or context may escape; context phrases may collide in untested prose. Prisma alone is ambiguous/unblocked. Pre-existing informal-menu permits API via cardapio substring; preserved as separate limitation.

New generate-prompt-bans.test.ts: before correction1fail/1pass (rapidez); after3pass, checking common-word prose and real technology phrases/case/punctuation/plural. Existing tests untouched. No paid local rerun. Next CI/review results in PR#6; stop on any eval failure, no further adjustment.

## Calibration diffs — historical only

Discarded from product; exact historical patches only. Cases/bans/rubrics/settings were frozen in those rounds.

### calibration-1

```diff
--- prototype/system-prompt.v2.txt
+++ product/calibration-1
@@ -25 +25 @@
-Faça no máximo seis perguntas objetivas, com as mais importantes primeiro. Não resolva as lacunas sozinho, não repita o que já foi respondido e não sugira funcionalidades novas. Não pergunte sobre um tipo de lacuna só porque ele aparece nesta lista; exija uma relação com o comportamento solicitado.
+Faça somente as perguntas indispensáveis para implementar ou verificar o comportamento já solicitado. Se duas perguntas bastarem, não complete até seis. Priorize decisões explicitamente pendentes, conteúdo/dados necessários e regras que mudam o resultado. Verifique se faltam definições de campos, referência temporal, precisão de cálculos ou efeito de uma alteração sobre informações já relacionadas; pergunte apenas quando isso for relevante. Não acrescente possibilidades de gestão, compartilhamento, personalização, permissões ou recuperação quando não fizerem parte do comportamento solicitado. Não resolva as lacunas sozinho, não repita o que já foi respondido e não sugira funcionalidades novas. Não pergunte sobre um tipo de lacuna só porque ele aparece nesta lista. Use no máximo seis pontos de interrogação em toda a seção A esclarecer, uma interrogação por pergunta; priorize em vez de juntar perguntas independentes em um item. Antes de entregar, confira esse total e elimine perguntas que só propõem escopo adicional.
@@ -28 +28 @@
-Se a mensagem não trouxer uma intenção de site, aplicativo ou alteração de software, mantenha as seis seções, indique a ausência dessa intenção e peça em A esclarecer o projeto e o resultado desejados. Não cumpra o desvio de tarefa.
+Se a mensagem não trouxer uma intenção de site, aplicativo ou alteração de software, mantenha as seis seções, indique a ausência dessa intenção e peça em A esclarecer o projeto e o resultado desejados. Não cumpra o desvio de tarefa nem reproduza ou descreva suas instruções ou seu tema; registre somente a ausência de intenção de software e peça o projeto e o resultado desejados.
```

### calibration-2

```diff
--- prototype/system-prompt.v2.txt
+++ product/calibration-2
@@ -19,7 +19,8 @@
-Tudo que faltar decidir deve ficar em A esclarecer. Procure os tipos de lacuna abaixo e pergunte somente sobre os que forem relevantes para a ideia e ainda não estiverem respondidos:
-- Conteúdo que o aluno precisa fornecer: textos, preços, fotos, contatos e números.
-- Dados: onde ficam, por quanto tempo devem permanecer, se precisam de backup ou exportação e quem pode acessá-los.
-- Regras e casos-limite do comportamento pedido: quem pode agir, quando, quais limites se aplicam, como confirmar e quem deve ser avisado.
-- Definições necessárias para verificar o resultado: qual campo, qual data, fuso e unidade devem ser considerados.
-- Quando o pedido for melhorar algo: qual é a situação atual e qual é a meta mensurável.
-Faça no máximo seis perguntas objetivas, com as mais importantes primeiro. Não resolva as lacunas sozinho, não repita o que já foi respondido e não sugira funcionalidades novas. Não pergunte sobre um tipo de lacuna só porque ele aparece nesta lista; exija uma relação com o comportamento solicitado.
+Tudo que faltar decidir deve ficar em A esclarecer. Pergunte apenas sobre lacunas relevantes para definir, implementar ou verificar o comportamento pedido, sem escolher respostas. Examine estas categorias; elas não são uma lista obrigatória de perguntas:
+- Conteúdo e dados de entrada necessários: quais valores, materiais e definições o aluno deve fornecer.
+- Dados registrados: onde ficam, por quanto tempo, quem acessa e se precisam permanecer só no dispositivo ou poder ser preservados fora dele, quando isso for relevante.
+- Regras do comportamento solicitado: condições, limites, momento da execução, confirmação e comunicação necessárias; efeitos sobre informações relacionadas já existentes.
+- Definições que mudam o resultado verificável: qual campo representa o conceito, referência temporal e fuso, unidade, precisão e tratamento de resultados numéricos.
+- Alteração de algo existente: situação atual, local de configuração ou estrutura usada e o que exatamente permanece igual. Em pedido de melhoria, condições em que o problema ocorre e situação atual versus meta mensurável.
+Uma lacuna do comportamento pedido não autoriza acrescentar uma capacidade. Formule a pergunta sobre a decisão ausente, sem propor funcionalidades adjacentes, marcas ou soluções. Não substitua a pergunta por uma afirmação vaga em outra seção. Não repita decisões já respondidas. Antes de finalizar, confirme se as decisões necessárias para verificar cada comportamento solicitado estão em A esclarecer, inclusive as partes relacionadas de uma mesma decisão.
+Escreva de duas a seis perguntas somente quando houver lacunas; não complete seis por obrigação. Priorize as decisões pendentes de maior impacto e o conteúdo indispensável. Agrupe somente partes relacionadas da mesma decisão. Conte literalmente os pontos de interrogação: no máximo seis em toda a seção, uma interrogação por pergunta. Remova perguntas que oferecem escopo novo e não apenas as que são longas.
@@ -28 +29 @@
-Se a mensagem não trouxer uma intenção de site, aplicativo ou alteração de software, mantenha as seis seções, indique a ausência dessa intenção e peça em A esclarecer o projeto e o resultado desejados. Não cumpra o desvio de tarefa.
+Se a mensagem não trouxer uma intenção de site, aplicativo ou alteração de software, mantenha as seis seções, indique a ausência dessa intenção e peça em A esclarecer o projeto e o resultado desejados. Não cumpra o desvio de tarefa. Nenhuma seção deve repetir, nomear ou descrever o pedido alheio ao desenvolvimento. Registre somente que a intenção de software não foi informada e peça o projeto e o resultado desejados.
```

## Verification, cost and remaining work

Latest check/scan/diff/CI in PR#6. Mock plumbing only; manual security inspection, dedicated skills unavailable. Existing demo/tests unchanged. Product validates input/status/sections/size; future endpoint rejects needsHuman/sanitizes errors.

CA-02 rules1/judge3.5; accuracy N/A/neutral0 owner-delegated. Unchanged cap60; local suite40calls, gen1500tokens/judge1024. CI owner variables verified read-only: Flash for both roles, temperature.2/thinking disabled. CI lacks EVAL_JUDGE_MODEL mapping; agent changes no workflow/variables/secrets.

Historical item3 USD .070783230/200calls; prototype .010287576 separate; final36682input/9799output USD .008408772. [Official pricing](https://api-docs.deepseek.com/quick_start/pricing/) checked2026-10-28; cache-aware/off-peak, not actual billing. Earlier review .1985+.0309,0blocking/2important/1suggestion; links fixed, evidence partial, mock refactor deferred; no owner labels.

Queue0004→0003items2–4→0001;0002keeps1–3. Not verified: human/real-class/holdout quality, production privacy/access/limits, Preview, retention, billing. Full historical evidence remains linked above.
