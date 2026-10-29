import { test, mock } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { harness, payload, request } from "../helpers/promptpro.ts";

test("INV-005 catches logging/persistence: success, provider failure and refusals retain no student text", async () => {
  const sentinel = "SENTINEL-IDEA-7731";
  const logs: string[] = []; const writes: string[] = [];
  for (const name of ["log", "error", "warn", "info", "debug"] as const) mock.method(console, name, (...values: unknown[]) => { logs.push(values.map(String).join(" ")); });
  for (const name of ["writeFileSync", "appendFileSync", "writeFile", "appendFile", "createWriteStream"] as const) {
    mock.method(fs, name, () => { writes.push(name); throw new Error("Unexpected persistence"); });
  }
  for (const name of ["writeFile", "appendFile", "open"] as const) mock.method(fsp, name, () => { writes.push(name); throw new Error("Unexpected persistence"); });
  syncBuiltinESMExports();
  try {
    const h = harness({ limit: 1 });
    assert.equal((await h.app(request(payload(sentinel)))).status, 200);
    assert.equal((await h.app(request(payload(sentinel)))).status, 429);
    assert.equal((await h.app(request({ idea: sentinel }))).status, 401);
    assert.equal((await harness({ fail: `provider echoed ${sentinel}` }).app(request(payload(sentinel)))).status, 502);
    assert.ok(!logs.join("\n").includes(sentinel)); assert.deepEqual(writes, []);
  } finally { mock.restoreAll(); syncBuiltinESMExports(); }
});
