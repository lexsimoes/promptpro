# Mission 0005: Public access with IP limits

**Status:** in progress — implementation and local verification complete; PR/hosted checks pending
**Branch:** `mission/0005-public-ip-access`
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

See [evidence and security review](../evidence/0005/README.md). Local check: 171 unit tests, 16 invariants; build passed. Three deliberate mutations failed and restored tests passed. The public mock browser flow generated ten versions; the eleventh was blocked with its idea retained. Edited copy matched the clipboard. No key was read, no paid model call was made. Native hosted enforcement, production credentials/budget, provider retention verification, DNS and HTTPS are pending.
