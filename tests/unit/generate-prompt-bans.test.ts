import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cases = readFileSync(new URL("../../evals/golden/generate-prompt.jsonl", import.meta.url), "utf8")
  .trim().split("\n").map((line) => JSON.parse(line) as { id: string; mustNotContain: string[] });
// Exactly the runner's matching rule; no normalization that would conceal a collision.
const rejects = (text: string, bans: string[]) => bans.some((ban) => text.toLowerCase().includes(ban.toLowerCase()));

const common = ["rapidez", "rapidamente", "terapia", "evite", "convite", "excelente",
  "redistribuir", "triangular", "prisma", "prismas", "capital", "capim", "apicultura", "apimentar"];

test("generation bans do not match ordinary Portuguese words in prose", () => {
  for (const item of cases) for (const word of common) {
    for (const text of [word, `A palavra ${word} aparece aqui.`, `(${word})`, `**${word}**`]) {
      assert.equal(rejects(text, item.mustNotContain), false, `${item.id}: false positive in ${text}`);
    }
  }
});

test("generation bans still reject actual technology choices", () => {
  for (const item of cases) for (const phrase of ["usar uma API", "com Vite", "planilha do Excel", "cache Redis", "framework Angular", "Prisma ORM"]) {
    if (item.id === "informal-menu" && phrase === "usar uma API") continue; // Original API allowance retained.
    for (const text of [phrase, phrase.toLowerCase(), `${phrase}.`, `${phrase}, depois continuar`, `${phrase}?`]) {
      assert.equal(rejects(text, item.mustNotContain), true, `missed technology: ${text}`);
    }
  }
});

test("delimited technology names and plural APIs remain banned in prose", () => {
  for (const item of cases) for (const term of ["API", "APIs", "Vite", "Excel", "Redis", "Angular"]) {
    if (item.id === "informal-menu" && term.startsWith("API")) continue; // Original API allowance retained.
    for (const end of [" depois", ", depois", ".", "?"]) {
      assert.equal(rejects(`Talvez ${term}${end}`, item.mustNotContain), true, `${item.id}: missed ${term}${end}`);
    }
  }
});
