export interface ClassCode { code: string; expiresAt: string; limit: number; active: boolean }
export const E2E_CODES: ClassCode[] = [
  { code: "turma-e2e", expiresAt: "2099-12-31T23:59:59Z", limit: 10000, active: true },
  { code: "turma-vencida", expiresAt: "2020-01-01T00:00:00Z", limit: 10000, active: true },
  { code: "turma-e2e-limite", expiresAt: "2099-12-31T23:59:59Z", limit: 1, active: true },
];
export function parseCodes(raw: string | undefined): ClassCode[] {
  const data: unknown = JSON.parse(raw ?? "null");
  if (!Array.isArray(data) || !data.length || data.length > 100) throw new Error("Invalid class configuration");
  const seen = new Set<string>();
  for (const value of data) {
    const c = value as ClassCode;
    if (!c || typeof c.code !== "string" || !c.code || c.code.length > 128 || c.code.trim() !== c.code || seen.has(c.code) ||
        typeof c.expiresAt !== "string" || !/(Z|[+-]\d{2}:\d{2})$/.test(c.expiresAt) || !Number.isFinite(Date.parse(c.expiresAt)) ||
        !Number.isSafeInteger(c.limit) || c.limit < 1 || c.limit > 100000 || typeof c.active !== "boolean") throw new Error("Invalid class configuration");
    seen.add(c.code);
  }
  return data as ClassCode[];
}
export function validClass(classes: ClassCode[], code: unknown, now: number): ClassCode | undefined {
  return classes.find((c) => c.active && c.code === code && now <= Date.parse(c.expiresAt));
}
