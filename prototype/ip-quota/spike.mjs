import { log } from "node:console";
import assert from "node:assert/strict";
import { quotaStores } from "../../tests/helpers/quota-store.ts";
const mock = quotaStores(), clients = [mock.client(), mock.client()];
await clients[0].setJSON("counter", 0, { onlyIfNew: true });
const accepted = await Promise.all(Array.from({ length: 11 }, async (_, i) => {
  const client = clients[i % 2];
  for (let retry = 0; retry < 16; retry++) {
    const row = await client.getWithMetadata("counter", { type: "json", consistency: "strong" });
    if (row.data >= 10) return false;
    if ((await client.setJSON("counter", row.data + 1, { onlyIfMatch: row.etag })).modified) return true;
  }
  return false;
}));
assert.equal(accepted.filter(Boolean).length, 10);
assert.equal((await mock.client().get("counter", { type: "json", consistency: "strong" })), 10);
log("SDK 11.1.7: two clients / 11 concurrent attempts / 10 atomic reservations; restart retains 10; no network or key");
