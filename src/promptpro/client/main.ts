const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const idea = element<HTMLTextAreaElement>("idea");
const prompt = element<HTMLTextAreaElement>("prompt");
const start = element("start"), result = element("result");
const generate = element<HTMLButtonElement>("generate"), regenerate = element<HTMLButtonElement>("regenerate"), copy = element<HTMLButtonElement>("copy");
const error = element("error"), progress = element("generation-status");
let busy = false;
let original: { idea: string; projectStatus?: "new" | "existing" } | undefined;
const number = new Intl.NumberFormat("pt-BR");
function update() {
  idea.value = idea.value.slice(0, 2000);
  element("idea-count").textContent = `${number.format(idea.value.length)} / 2.000 caracteres`;
  generate.disabled = busy || !idea.value.trim(); regenerate.disabled = busy; copy.disabled = busy || !prompt.value.trim();
  idea.readOnly = busy; prompt.readOnly = busy;
  start.setAttribute("aria-busy", String(busy)); result.setAttribute("aria-busy", String(busy)); progress.hidden = !busy;
}
async function api(path: string, data: Record<string, unknown>) {
  const response = await fetch(path, { method: "POST", credentials: "omit", cache: "no-store", redirect: "error", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal: AbortSignal.timeout(25000) });
  // Rate limits can be an HTML response from the hosting edge. Do not surface raw bodies.
  let body: { prompt?: unknown; error?: unknown } = {};
  if (response.headers.get("content-type")?.includes("application/json")) body = await response.json();
  return { response, body };
}
async function run(newVersion: boolean) {
  if (busy) return;
  const checked = document.querySelector<HTMLInputElement>('input[name="project-status"]:checked');
  const next = newVersion ? original : { idea: idea.value, ...(checked ? { projectStatus: checked.value as "new" | "existing" } : {}) };
  if (!next?.idea.trim()) return;
  busy = true; error.hidden = true; element("copy-status").textContent = ""; update();
  try {
    const { response, body } = await api("/api/generate", next);
    if (!response.ok || typeof body.prompt !== "string") {
      error.textContent = response.status === 429 ? "Você chegou ao limite de 10 gerações por hora nesta rede. Sua ideia continua aqui; tente novamente mais tarde." :
        [401, 403].includes(response.status) ? "Este endereço não está disponível. Sua ideia continua aqui. Acesse getprompt.pro para continuar." :
        "Não foi possível gerar o prompt. Sua ideia continua aqui. Tente novamente ou fale com o responsável pelo curso.";
      error.hidden = false; return;
    }
    original = next; prompt.value = body.prompt;
    element("original-idea").textContent = original.idea;
    start.hidden = true; result.hidden = false; prompt.scrollTop = 0; prompt.setSelectionRange(0, 0); element("result-title").focus();
  } catch { error.textContent = "Não foi possível gerar o prompt. Sua ideia continua aqui. Tente novamente."; error.hidden = false; }
  finally { busy = false; update(); }
}
idea.addEventListener("input", update); prompt.addEventListener("input", update);
element("idea-form").addEventListener("submit", (event) => { event.preventDefault(); void run(false); });
regenerate.addEventListener("click", () => { void run(true); });
copy.addEventListener("click", () => {
  void Promise.resolve().then(() => navigator.clipboard.writeText(prompt.value)).then(() => {
    element("copy-status").textContent = "O prompt foi copiado com suas edições.";
  }).catch(() => {
    prompt.focus(); prompt.select(); element("copy-status").textContent = "Não foi possível copiar automaticamente. O texto está selecionado; use a opção Copiar do seu dispositivo.";
  });
});
element("start-over").addEventListener("click", (event) => {
  event.preventDefault(); if (busy) return;
  original = undefined; idea.value = ""; prompt.value = ""; error.hidden = true;
  element("copy-status").textContent = "";
  document.querySelectorAll<HTMLInputElement>('input[name="project-status"]').forEach((radio) => { radio.checked = false; });
  result.hidden = true; start.hidden = false; update(); idea.focus();
});
document.querySelectorAll<HTMLButtonElement>(".chips button").forEach((button) => button.addEventListener("click", () => {
  if (busy) return; idea.value = button.textContent ?? ""; update(); idea.focus();
}));
const theme = element<HTMLButtonElement>("theme");
function themeLabel() {
  const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  const label = dark ? "Mudar para tema claro" : "Mudar para tema escuro";
  theme.setAttribute("aria-label", label); theme.textContent = dark ? "Tema claro" : "Tema escuro";
}
theme.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "light" : "dark"; themeLabel();
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeLabel);
themeLabel(); update();
export {};
