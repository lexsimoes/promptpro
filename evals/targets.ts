// Links a "target" name (in evals/config.json) to the app function it measures.
// To evaluate a new function that uses an LLM, add an entry here.

import { MAX_SUMMARY_CHARS, classifyMessage } from "../src/ai/classify-message.ts";
import { generatePrompt, MAX_PROMPT_CHARS } from "../src/ai/generate-prompt.ts";
import type { ProjectStatus } from "../src/ai/generate-prompt.ts";
import type { LLMClient } from "../src/ai/llm.ts";

export interface TargetOutput {
  /** Label compared with `expected.category` from the golden set. */
  label: string;
  /** Free text checked by the rules and the judge. */
  text: string;
  maxChars: number;
  needsHuman: boolean;
}

export type Target = (input: string, llm: LLMClient) => Promise<TargetOutput>;

export const TARGETS: Record<string, Target> = {
  async generatePrompt(input, llm) {
    let idea = input;
    let projectStatus: ProjectStatus | undefined;
    if (input.trimStart().startsWith("{")) {
      const parsed: unknown = JSON.parse(input);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid generation input");
      const data = parsed as Record<string, unknown>;
      if (typeof data.idea !== "string" || (data.projectStatus !== undefined && data.projectStatus !== "new" && data.projectStatus !== "existing")) {
        throw new Error("Invalid generation input");
      }
      idea = data.idea;
      projectStatus = data.projectStatus as ProjectStatus | undefined;
    }
    // The template mock classifies messages. Adapt only this new target's mock response
    // to the product schema; still call the budgeted client so call ceilings are exercised.
    // This synthetic fixture measures plumbing, never prompt quality or ambiguity coverage.
    const client: LLMClient = llm.name === "mock" ? {
      name: "mock",
      async complete(request) {
        const response = await llm.complete(request);
        return { ...response, text: "## Objetivo\nOrganizar o pedido.\n## Contexto\nSimulação para verificar o fluxo de avaliação.\n## Requisitos\nRevisar os detalhes fornecidos.\n## Restrições\nEsta simulação não mede qualidade.\n## Critérios de conclusão\nAs seis seções estão presentes.\n## A esclarecer\nQual resultado precisa ser confirmado?" };
      },
    } : llm;
    const result = await generatePrompt(idea, client, projectStatus);
    return { label: "", text: result.text, maxChars: MAX_PROMPT_CHARS, needsHuman: result.needsHuman };
  },
  async classifyMessage(input, llm) {
    const result = await classifyMessage(input, llm);
    return { label: result.category, text: result.summary, maxChars: MAX_SUMMARY_CHARS, needsHuman: result.needsHuman };
  },
};
