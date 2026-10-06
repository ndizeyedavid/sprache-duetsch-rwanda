# Functional correction report — 5 October 2026

## Status

This implementation addresses the 30 findings in `FUNCTIONAL_AUDIT_2026-10-05.md`: **28 have code corrections, F12 is resolved by the user's decision to retain manual payments, and R03 has its queue/retry/operator controls implemented but still needs external provider configuration and live delivery verification.** It would be inaccurate to claim that production email, SMS or WhatsApp delivery is working without configured providers.

Changes are in the current working tree. They include database migrations and substantial decomposition of previously oversized services and screens. Existing project edits were preserved. No deployment or release commit was made.

## Finding-by-finding outcome

| Finding | Correction / capability | Status |
| --- | --- | --- |
| F01 | Refresh finance at student access/profile/finance reads and before reminders; overdue follows the current date. | Implemented |
| F02 | Allocate payments and approved discounts to oldest due obligations first; distinguish overdue from future balance. | Implemented |
| F03 | Reject mixed currencies within a student's ledger; retain its actual currency in finance data and student displays. | Implemented |
| F04 | Check refunds inside serializable transactions; cap total refunds; forbid refund edits and edits to voided payments. Staff have correction/refund/void controls. | Implemented |
| F05 | Serializable transactions with retry handling and a per-student advisory lock protect finance recalculation. | Implemented |
| F06 | Reject editable enrollment discounts and direct staff to the audited request/approval workflow. | Implemented |
| F07 | Cap percentages at 100 and approved amounts against eligible and total charges transactionally. | Implemented |
| F08 | Attribute charges, discounts and payments through their historical enrollment. Collections subtract refunds; billed subtracts approved discounts. Current outstanding is labeled separately from period movements. Payment recording offers an enrollment selector. | Implemented |
| F09 | Ledger changes, audit rows and associated activity entries commit together. Optional payment idempotency keys prevent duplicate records/receipts on retries; the recording form supplies one. | Implemented |
| F10 | Tuition can be split into dated installments without double billing. Show remaining amount/status, overdue amount and next payment. Due-soon reminders use configurable lead days. | Implemented |
| F11 | New graded work is gated by overdue obligations under the configured access policy, rather than future unpaid installments. Past result viewing is separate. | Implemented |
| F12 | Keep payments manual. Show approved method instructions, record receipts and maintain correction/refund/void history. No checkout or gateway is claimed. | User decision implemented |
| I01 | Bill registration and book fees as separate charges once per student/intake; disclose them in enrollment creation. | Implemented |
| I02 | Check class level, intake, campus, activity and capacity transactionally. Reject capacity below current active occupancy. | Implemented |
| I03 | Enforce active intakes and enrollment windows; early/late enrollment requires an audited reason. | Implemented |
| I04 | Validate merged intake start/end/open/close dates on updates. | Implemented |
| I05 | Reconcile the current level from active enrollments; clear completion dates on reopening; placement fields do not independently grant access. Active/completed enrollment records govern course access. | Implemented |
| L01 | Recursively remove graded answer keys from student activity configurations. Self-practice feedback is released after submission. Ordering options do not preserve the answer-key order. | Implemented |
| L02 | Share lesson availability checks across reading, progress and activity submission; enforce publication, release, module/lesson prerequisites and payment policy. | Implemented |
| L03 | Persist upload ownership and authorize linked lessons, assessment resources and managed books by role/level. | Implemented |
| L04 | Resolve protected audio/video/image/PDF through authenticated fetches and managed object URLs; include loading/error states and cleanup. | Implemented; device/network coverage remains limited |
| L05 | Serialize attempt start/submission; resume an existing active attempt; freeze questions, keys, points, duration and pass mark. | Implemented |
| L06 | Reject unknown/duplicate answer IDs and grades above frozen question limits; commit answers and attempt totals together. Staff detail uses frozen prompts/limits. | Implemented |
| L07 | Configure per-level attendance/homework thresholds; require all published lessons and every published final. Validate linked enrollment and issue/revoke certificates transactionally. | Implemented |
| L08 | Configure uploaded PDF coursebooks and page counts per level through the CMS. A1's existing bundled book remains a fallback. Actual books must still be supplied for each level. | Capability implemented |
| R01 | Store unique delivery event keys per recipient independently of inbox visibility; rescheduling creates a new event version. | Implemented |
| R02 | Topic switches apply consistently to email and in-app notifications. Serialize saves and preserve reversals while older requests remain in flight. | Implemented |
| R03 | Durable email queue, claims, crash recovery, bounded retries, operator status/retry view, expiry for recovery links, and neutral public reset responses. Email worker runs independently of reminder enablement. | External configuration / live delivery pending |
| R04 | Persistent atomic identifier counters replace count-based numbering. Void receipts retain their original identifiers. | Implemented |
| R05 | Add frontend tests, repeatable integration runner and CI workflow; decompose large files and enforce 200 physical lines without legacy screen exemptions. | Implemented |

## Policies implemented

- Each student uses one ledger currency. There is no currency conversion feature. A report covering mixed currencies is rejected rather than silently adding them.
- Credits cover the oldest due charges first. Undated charges are due immediately. Credits/overpayments remain distinguishable from future unpaid obligations.
- Registration and book fees are charged once per student in an intake, regardless of the number of levels in that intake. Withdrawal does not automatically refund or erase financial history.
- Tuition defaults to the intake start date. Explicit installments must have positive amounts, increasing dates and a sum equal to tuition.
- `UNPAID_ACCESS=LIMITED` permits lessons/live classes while overdue balances block starting graded work. `FULL` and `NONE` remain configurable. Historical attempt ownership is checked separately.
- Active and completed enrollments retain course access. Withdrawn/deferred enrollments and intended/current placement fields do not grant it.
- Certificates require the configured academic rules. Payment clearance is not silently added as a certificate requirement.
- Notification topic choices apply to both supported channels. Password recovery is transactional email and does not depend on notification opt-in.

## Verification performed

| Check | Result |
| --- | --- |
| Backend Prisma generation and migration deployment | Passed; functional integrity and manual payment idempotency migrations applied locally |
| Backend typecheck and production build | Passed |
| Backend unit tests | 21 files, 64 tests passed |
| Frontend unit tests | 3 files, 8 tests passed |
| Backend integration runner | Finance, learning and delivery suites passed |
| Frontend production build | Passed, including PWA generation |
| Frontend/backend lint | Passed with the physical 200-line limit enforced |
| Frontend/backend dependency audit | Zero known vulnerabilities reported at the time of verification |
| `git diff --check` | Passed |

Integration coverage includes dated obligations, all intake fees, currency rejection, concurrent payments/refunds, idempotent payment retries, receipt retention, discount caps, historical intake reporting, withdrawal access, two simultaneous enrollments competing for the last seat, protected file downloads, nested answer secrecy, unpublished/future lessons, concurrent attempt start/submission, frozen grading keys/limits, certificate eligibility/issue/revoke/reissue/PDF generation, email-only reminder deduplication, late recipients, topic opt-outs and simulated provider failures/retries.

Concurrent fixtures deliberately trigger serialization conflicts; the transaction helper retries them. The installed PostgreSQL driver can also emit a query-queue deprecation warning during conflict handling. These runs completed successfully; the warning is not evidence of failed assertions.

Browser checks used the student, teacher and academic portals. Student dashboard/profile/payment schedules and manual method instructions loaded. Teacher content, grading and reports loaded. Academic enrollment creation showed fees/installment controls; finance and transactions showed reconciled totals, refund history and the payment management dialog. The announcements screen visibly reported that email was unconfigured. Browser inspection did not change real student financial records or send real messages.

The CI workflow was added but has not been run by a remote CI service in this session. Browser coverage does not establish playback/seek behavior on every mobile browser or unreliable network, and this report does not certify the educational completeness of A1–B2 content.

## Remaining setup and release work

1. **Configure and verify email delivery:** provide `SMTP_USER` / `SMTP_PASS` / related SMTP settings or `EMAIL_RELAY_URL` / `EMAIL_RELAY_SECRET` through the backend environment. Check the delivery panel, then verify a controlled password-reset delivery and reminder using an authorized recipient. Never paste provider passwords into chat. SMS/WhatsApp providers are still unimplemented; they must not be advertised as working channels.
2. **Supply level content:** upload the correct coursebook PDF and page count for each level, set attendance/homework certificate thresholds, and have teachers review curriculum coverage and assessment quality. CMS support does not create missing educational material.
3. **Review live manual payment instructions:** seeded account numbers and method instructions are development examples and need the school's real details before launch.
4. **Apply migrations in each release environment:** run backend `npm ci`, `npm run db:generate`, and `npm run db:deploy`; then run the verification commands below.

## Repeatable verification

Backend: `npm run db:generate`, `npm run db:deploy`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:integration`, `npm run build`.

Frontend: `npm run lint`, `npm test`, `npm run build`.

Dependency checks: run `npm audit` in both package directories. Prisma 7 remains in use; patched `deepmerge-ts` and `mysql2` overrides are recorded in the backend manifest/lockfile and passed Prisma generation/deployment checks.
