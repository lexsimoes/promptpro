# Mission 0005: Public access with IP limits

**Status:** in progress — shared quota verified locally; hosted verification pending
**Branch:** `mission/0005-public-ip-access` · **PR:** [#8](https://github.com/lexsimoes/promptpro/pull/8)
**Approved by the owner:** 2026-10-28

## Goal and authorization

Open promptPRO without class codes and restrict generation to 10 attempts per IP per hour. The owner explicitly authorized replacing INV-003 and its tests in a separate PR on 2026-10-28. This PR depends on mission 0004 / PR #7; never merge either PR as an agent or apply owner-only labels. The owner also authorized production publication on `getprompt.pro`; publishing remains blocked until the reviewed changes are merged by the owner, production credentials/budget and DNS/HTTPS are ready.

Allowed: product access/server/UI wiring, a bounded in-memory IP backstop, native Netlify rate configuration, INV-003's replacement, new unit tests and corresponding specifications/evidence. Owner exception, 2026-10-28: Netlify Blobs on the existing account and exact @netlify/blobs 11.1.7 are approved for a shared atomic counter (derived IP identifier, count and expiry only; no ideas/prompts). No other new dependencies, AI prompt/model/eval changes, demo changes, other invariant edits, existing unit/e2e test edits or CI changes. Keep the legacy class handler path only to preserve existing isolated fixtures; hosted runtimes always choose public access and never parse CLASS_CODES_JSON.

## Acceptance

- Public `/` shows the idea form without a fragment or code; generation, edited copy and regeneration work.
- Netlify supplies `context.ip`; local Node supplies the socket address. Missing/invalid identity fails closed; forwarding headers cannot supply it.
- Ten valid attempts atomically reserve the shared quota before the model. The eleventh is refused; failures/concurrency count; another IP is independent; a quota renews one hour after its first attempt.
- Use a stable Blobs namespace across deployments, with strongly consistent reads and conditional writes; no memory fallback on storage failure. Netlify 60/60s/domain+IP is supplemental burst mitigation. Verify post-processing and hourly persistence across a Preview redeploy.
- INV-003 includes violation detection; demonstrate deliberate failures only in a disposable copy. Other invariants remain unchanged and pass.
- Check/build pass; security review and secret scan of the diff; screenshots at 375/1280 in both themes and a 768 overflow check.
- A full-template draft PR, with owner-only invariant-approved required. No merge, owner label or production release without the remaining prerequisites.

## Report

See [evidence and security review](../evidence/0005/README.md). Local check: 175 unit tests, 16 invariants; build passed. Three deliberate mutations failed and restored tests passed. The public mock browser flow generated ten versions; the eleventh was blocked with its idea retained. Edited copy matched the clipboard. No key was read. Two TEST-provider generations on Preview #8 succeeded without a code; edited copy and regeneration passed. CI quality, dependencies and demo e2e passed; invariant guard awaits the owner label. The platform rejected the original hourly window (10–180 seconds only). The owner authorized Blobs/SDK; two independent SDK clients now share atomic reservations, including restart/expiry/error tests. The owner applied invariant-approved. Preview #8 remains disabled until hosted verification; PR #8 now targets #7's branch for focused review. Native hosted enforcement, production credentials/budget, provider retention verification, DNS and HTTPS are pending.
