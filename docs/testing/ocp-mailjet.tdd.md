# TDD evidence — Mailjet MailView (OCP parte 3)

**Source plan:** `.claude/plans/ocp-mailjet-mail-view.plan.md`

## User journeys

1. As ops, I want `MAIL_DRIVER=mailjet` so the acceptance letter is sent via Mailjet without changing registration rules.
2. As a developer, I want console and Resend to keep working so Mailjet is an extension, not a rewrite.
3. As a reviewer, I want unit tests of the adapter so we never hit the live Mailjet API in CI.

## Task report

| Task | Command | RED | GREEN | Guarantee |
|------|---------|-----|-------|-----------|
| `parseEmailFrom` | `vitest run tests/unit/views/parseEmailFrom.test.ts` | missing module | 3 passed | RFC-style `Name <email>` and bare email |
| `MailjetMailView` | `vitest run tests/unit/views/MailjetMailView.test.ts` | missing module | 6 passed | View Model → Send API v3.1; CID → InlinedAttachments; errors prefixed `Mailjet error:` |
| `createMailView` / `loadConfig` | `vitest run tests/unit/views/createMailView.test.ts tests/unit/composition/loadConfig.mail.test.ts` | missing factory; driver fell back to console | 8 passed | Three drivers; fail-fast without Mailjet keys; unknown driver rejected |

## Test specification

| # | What is guaranteed | Test file | Type | Result |
|---|--------------------|-----------|------|--------|
| 1 | `"North Pole HR <hr@…>"` splits name and email | `tests/unit/views/parseEmailFrom.test.ts` | unit | PASS |
| 2 | Bare email has no name field | same | unit | PASS |
| 3 | Empty sender throws | same | unit | PASS |
| 4 | Letter maps to Mailjet `Messages[0]` | `tests/unit/views/MailjetMailView.test.ts` | unit | PASS |
| 5 | Inline CID becomes `InlinedAttachments.ContentID` | same | unit | PASS |
| 6 | Failed Mailjet status throws `Mailjet error:` | same | unit | PASS |
| 7 | Rejected send throws `Mailjet error:` | same | unit | PASS |
| 8 | `fromApiKeys` POSTs to `/v3.1/send` with Basic auth | same | unit | PASS |
| 9 | `fromApiKeys` wraps non-OK HTTP as `Mailjet error:` | same | unit | PASS |
| 10 | Factory returns Console / Resend / Mailjet by driver | `tests/unit/views/createMailView.test.ts` | unit | PASS |
| 11 | Missing Mailjet or Resend keys fail fast | same | unit | PASS |
| 12 | `loadConfig` reads Mailjet env | `tests/unit/composition/loadConfig.mail.test.ts` | unit | PASS |
| 13 | Unknown `MAIL_DRIVER` throws | same | unit | PASS |

## Coverage and gaps

- No live Mailjet send in CI (intentional). Manual check needs a verified sender.
- Integration/e2e keep `ConsoleMailView` override; they prove the register flow, not the vendor.
- `node-mailjet` was not added: registry 403 in this environment; HTTP Send API v3.1 is the public contract.

## Merge evidence

RED: new tests failed on missing modules / old `MAIL_DRIVER` fallback.  
GREEN: adapter + factory + `loadConfig` made those tests pass.  
Refactor: duplicated root ternaries replaced by `createMailView`.
