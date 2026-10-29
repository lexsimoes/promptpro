import { createHash } from "node:crypto";
import type { LLMClient } from "../ai/llm.ts";
/** Isolated e2e fixture only. No real provider or browser-visible class configuration. */
export function createPromptMock(): LLMClient {
  const versions = new Map<string, number>();
  return { name: "mock", async complete(request) {
    const { idea, projectStatus } = JSON.parse(request.user) as { idea: string; projectStatus?: string };
    if (idea.includes("E2E-FALHA-PROVEDOR")) throw new Error("Simulated provider failure");
    const id = createHash("sha256").update(idea).digest("hex");
    const version = (versions.get(id) ?? 0) + 1;
    versions.set(id, version);
    return { model: "mock", text: `## Objetivo
${idea.slice(0, 40)}

## Contexto
${projectStatus === "new" ? "Projeto novo.\n" : projectStatus === "existing" ? "Projeto existente.\n" : ""}Versão ${version}

## Requisitos
Preservar os detalhes fornecidos na ideia.

## Restrições
Não acrescentar funcionalidades ou tecnologias.

## Critérios de conclusão
O resultado atende ao pedido informado.

## A esclarecer
Quais detalhes ainda precisam ser definidos?` };
  } };
}
