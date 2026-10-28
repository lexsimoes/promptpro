# Mission 0005: Public access with IP limits

**Status:** in progress — blocked — native one-hour window rejected; owner storage decision pending
**Branch:** `mission/0005-public-ip-access` · **PR:** [#8](https://github.com/lexsimoes/promptpro/pull/8)
**Approved by the owner:** 2026-10-28

## Goal and authorization

Open promptPRO without class codes and restrict generation to 10 attempts per IP per hour. The owner explicitly authorized replacing INV-003 and its tests in a separate PR on 2026-10-28. This PR depends on mission 0004 / PR #7; never merge either PR as an agent or apply owner-only labels. The owner also authorized production publication on `getprompt.pro`; publishing remains blocked until the reviewed changes are merged by the owner, production credentials/budget and DNS/HTTPS are ready.

Allowed: product access/server/UI wiring, a bounded in-memory IP backstop, native Netlify rate configuration, INV-003's replacement, new unit tests and corresponding specifications/evidence. No new dependencies, AI prompt/model/eval changes, demo changes, other invariant edits, existing unit/e2e test edits, CI changes or persistent storage. Keep the legacy class handler path only to preserve existing isolated fixtures; hosted runtimes always choose public access and never parse CLASS_CODES_JSON.

## Acceptance

- Public `/` shows the idea form without a fragment or code; generation, edited copy and regeneration work.
- Netlify supplies `context.ip`; local Node supplies the socket address. Missing/invalid identity fails closed; forwarding headers cannot supply it.
- Ten valid attempts reserve the instance-local quota before the model. The eleventh is refused; failures/concurrency count; another IP is independent; a quota renews one hour after its first attempt.
- Native function configuration: 10 requests / 3,600 seconds / domain+IP. Verify it on a Preview before production; explicitly disclose the platform's asynchronous enforcement and cold-start limitations.
- INV-003 includes violation detection; demonstrate deliberate failures only in a disposable copy. Other invariants remain unchanged and pass.
- Check/build pass; security review and secret scan of the diff; screenshots at 375/1280 in both themes and a 768 overflow check.
- A full-template draft PR, with owner-only invariant-approved required. No merge, owner label or production release without the remaining prerequisites.

## Report

See [evidence and security review](../evidence/0005/README.md). Local check: 171 unit tests, 16 invariants; build passed. Three deliberate mutations failed and restored tests passed. The public mock browser flow generated ten versions; the eleventh was blocked with its idea retained. Edited copy matched the clipboard. No key was read. Two TEST-provider generations on Preview #8 succeeded without a code; edited copy and regeneration passed. CI quality, dependencies and demo e2e passed; invariant guard awaits the owner label. Post-processing rejected the native one-hour window (accepted range 10–180 seconds). Preview #8 is disabled pending a shared-counter decision; never call this quota complete. Native hosted enforcement, production credentials/budget, provider retention verification, DNS and HTTPS are pending.
