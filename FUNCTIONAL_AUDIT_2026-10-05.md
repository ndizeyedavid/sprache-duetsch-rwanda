# Second functional audit — 5 October 2026

Implementation follow-up: see [Functional correction report](FUNCTIONAL_FIX_REPORT_2026-10-05.md) for current outcomes and verification. This audit remains the original finding record.

## Assessment

The platform has substantial working implementations for teaching, learning, assignments, attendance and financial record keeping. It is not yet ready to claim that all workflows are correct. The largest remaining risks are financial correctness, enrolment consistency, access to learning resources, and assessment integrity.

This pass traced current source code across enrolments, intakes, classes, finance, reminders, uploads, lessons, activities, assessments, homework, certificates and notification settings. Two defects were reproduced with isolated runtime fixtures: incorrect overdue classification and nested activity answer leakage. No student records were changed and no messages were sent. Other findings below are supported by source inspection; race conditions need concurrent integration tests before their fixes can be considered verified.

The previous pass's successful build/lint checks and 46 backend tests remain useful baseline evidence, but do not validate these scenarios. This pass did not repeat that entire suite or perform a complete browser/device audit. This is a review of the current, already modified working tree, not a clean release commit. Educational quality and completeness of the actual A1–B2 course content have not been established by this code review.

Severity: **P1** means address before relying on the workflow in production; **P2** means a significant incomplete capability or reliability problem. Policy decisions are explicitly identified.

## Finance and paying on time

### F01 — P1: overdue status becomes stale as time passes

Evidence: `backend/src/lib/finance.ts:44`, `backend/src/modules/payments/payments.service.ts:1071`, `backend/src/lib/reminders.ts:66`.

Finance status is recalculated on financial mutations. The daily reminder job filters already stored `OVERDUE` profiles without refreshing their status. A student who was unpaid before yesterday's deadline can remain `UNPAID` today and miss overdue reminders until another financial mutation occurs. Student finance reads also return the stored status.

Correction: derive due/overdue amounts from dated obligations at read/job time, or refresh affected profiles before reminder selection. Verify a deadline passing without any payment or charge edit.

### F02 — P1: paid historical charges cause false overdue status

Evidence: `backend/src/lib/finance.ts:63`.

The calculation treats any old due date plus any positive overall balance as overdue. Runtime fixture: an old charge of 100, a future charge of 100, and payments of 100 produce `OVERDUE`, even when the old obligation is covered. Payments and discounts are not allocated to individual due obligations.

Correction: define allocation rules and calculate unpaid due amounts separately from future balances. Verify partial payments, credits, discounts, refunds and multiple due dates.

### F03 — P1: different currencies are added into one balance

Evidence: `backend/src/lib/finance.ts:47`, `backend/src/modules/payments/payments.service.ts:249`, `backend/src/modules/payments/payments.service.ts:507`.

Charges and payments accept currencies, but finance aggregates all amounts by student without currency grouping or conversion. The profile's currency is not updated by the recalculation. Recording 100 USD against RWF tuition subtracts 100 numeric units and can misstate the currency shown.

Correction: enforce a single ledger currency per student/enrolment, or implement separate currency ledgers and explicit conversion records. Never silently sum currencies.

### F04 — P1: refund limits are unsafe under concurrency and payment edits

Evidence: `backend/src/modules/payments/payments.service.ts:724`, `backend/src/modules/payments/payments.service.ts:662`.

The total-refunded check occurs before the refund transaction. Two concurrent requests can both pass the check and collectively exceed the original payment. Payment editing also permits reducing the original below its existing refunds, and permits changing refund amounts without rechecking the parent limit.

Correction: lock/check the parent inside a suitably isolated transaction and validate edits against refund totals. Verify two simultaneous refunds and editing either side of a refunded payment.

### F05 — P1: balance recalculation can lose concurrent financial updates

Evidence: transactions in `backend/src/modules/payments/payments.service.ts`; aggregate/upsert sequence in `backend/src/lib/finance.ts`.

Financial mutations generally use default transaction isolation. Concurrent mutations can calculate totals from different snapshots and overwrite the denormalized profile with a stale balance even though both underlying records commit. Using Decimal addresses precision, but does not serialize updates.

Correction: serialize mutations per student, or use serializable transactions with retry handling. Verify concurrent payments, payment plus refund, and payment plus charge against a fresh aggregate of committed records.

### F06 — P1: enrolment discounts do not reduce the financial balance

Evidence: `backend/src/modules/enrollments/enrollments.service.ts:177`, `backend/src/modules/enrollments/enrollments.service.ts:270`, `backend/src/lib/finance.ts:49`.

The enrolment API accepts and stores `discountTotal`, but does not create an approved discount or subtract it from its tuition charge. Updating only that field does not recalculate finance. The balance writer reads approved Discount records, not Enrollment.discountTotal.

Correction: remove this competing field from editable inputs or connect it to the audited discount approval workflow. Verify the displayed enrolment fee and authoritative ledger agree.

### F07 — P1: discount amounts have no meaningful upper bound

Evidence: `backend/src/modules/payments/payments.schema.ts:80`, `backend/src/modules/payments/payments.service.ts:378`.

Percentage values are not capped at 100, and approval does not check cumulative discounts against the eligible charges. A 150% discount or multiple overlapping discounts can create a negative total due and classify the student as waived.

Correction: validate percentage limits and cumulative approved amounts transactionally. If intentional credits are supported, record them separately with an explicit policy.

### F08 — P1: historical intake, level and campus reports use current student attributes

Evidence: `backend/src/modules/payments/payments.service.ts:904`.

The report filters students by current profile fields, then groups their entire matching financial history under those fields. A student moving from intake A to B moves old tuition/payment totals into B. Outstanding is all-time, while billed/collected can be date-filtered; method totals include payments without subtracting refunds. Approved discounts are not included in billed totals.

Correction: attribute transactions through their enrolment's historical intake/level/campus and label opening balance, period movements and closing balance separately. Define gross/net collection metrics consistently.

### F09 — P1: financial audit rows are outside the business transaction

Evidence: `backend/src/modules/payments/payments.service.ts:507`, `backend/src/modules/payments/payments.service.ts:724`, `backend/src/lib/audit.ts`.

Many mutations commit first and call `writeAudit` afterward. If the audit write fails, the money change remains committed while the request can fail, inviting duplicate retries and leaving no required audit entry. `writeAuditTx` exists but these financial workflows do not use it.

Correction: commit ledger changes and audit records atomically. Use an outbox for subsequent messages/activity and idempotency keys for payment creation and provider callbacks.

### F10 — P2: partial payments exist; instalment planning is incomplete

Evidence: `backend/prisma/schema.prisma` charge/payment models; `frontend/src/components/enrolments/EnrolFields.tsx`; `backend/src/modules/enrollments/enrollments.service.ts:204`.

Multiple payments can reduce a balance. There is no explicit instalment agreement, allocation, scheduled instalment status or next-payment amount/date. Enrolment creates one tuition charge, defaulting its due date to intake end. The enrolment UI does not offer a due date. The reminder job only handles already overdue balances; there are no upcoming-payment reminders.

Correction: add a schedule for splitting existing tuition into dated obligations without charging tuition twice. Show paid-to-date, due now, next instalment and future balance separately, with configurable reminder timing.

### F11 — P2 / policy decision: students paying on schedule can still be blocked from exams

Evidence: `backend/src/lib/access.ts:82`; assessment list/result/start services.

Under `UNPAID_ACCESS=LIMITED`, any positive balance blocks assessment access, including future amounts not yet due. Several result/history endpoints use the same gate. A student following an instalment agreement could lose access to exams or past feedback despite being up to date.

Correction: agree whether access depends on total unpaid balance or overdue obligations, and implement that rule explicitly. Keep viewing historical results distinct from starting a new exam.

### F12 — P2: payment self-service is manual record keeping

Evidence: `backend/src/modules/payments`, API route/schema inspection.

Configurable payment methods and receipts exist, but no checkout, gateway webhook or provider reconciliation flow was found. A method labelled MoMo/card is not an online payment integration. Provider choice, merchant credentials and operational policy are needed before implementing real payment collection.

## Intakes and enrolment lifecycle

### I01 — P1: intake fees are configured but not billed by enrolment

Evidence: `backend/src/modules/intakes/intakes.service.ts:68`, `backend/src/modules/enrollments/enrollments.service.ts:195`.

Registration and book fees are saved on the intake. Enrolment creates tuition only; no other backend consumer of those fee fields was found. Staff can believe those configured fees are being collected when the ledger omits them.

Correction: define whether each fee is per student, intake or level and generate the appropriate separate charges exactly once. Include the complete fee breakdown before staff confirm enrolment.

### I02 — P1: class assignment omits intake, campus, activity and capacity checks

Evidence: `backend/src/modules/enrollments/enrollments.service.ts:133`, `backend/src/modules/enrollments/enrollments.service.ts:255`.

Create/update validates the class's level only. The API accepts a matching-level class from another intake/campus, a disabled class, or an over-capacity class. UI filters some choices, but do not enforce the data rule at the API boundary. Class capacity edits also do not check current active occupancy.

Correction: validate all class/enrolment dimensions and occupancy inside the transaction, including simultaneous enrolments competing for the last seat.

### I03 — P2 / policy decision: intake enrolment windows are display/configuration only

Evidence: `backend/src/modules/intakes/intakes.schema.ts`, `backend/src/modules/enrollments/enrollments.service.ts:115`.

The API does not enforce intake activity or enrolment opening/closing dates when enrolling students. If staff need late/early enrolment, that should be an explicit override with reason and audit, rather than silently ignoring configured windows.

### I04 — P1: intake edits can produce invalid timelines

Evidence: `backend/src/modules/intakes/intakes.schema.ts`, `backend/src/modules/intakes/intakes.service.ts:81`.

Create validates end after start, but partial updates do not validate the resulting combined dates. Enrolment opening/closing order is not checked. Editing only the end date can place it before an existing start date.

Correction: validate merged date values in the service and validate window order for both create and update.

### I05 — P2: enrolment transitions leave inconsistent profile/access state

Evidence: `backend/src/modules/enrollments/enrollments.service.ts:208`, `backend/src/modules/enrollments/enrollments.service.ts:278`, `backend/src/lib/access.ts:37`.

New enrolment changes intake/campus but changes currentLevelId only if it was previously empty. Completing, withdrawing or deferring an enrolment does not reconcile the student's current level. Reopening a completed enrolment does not clear completedAt. Access unconditionally includes currentLevelId, so withdrawing/defering the sole enrolment can leave access to that level.

Correction: define legal transitions and current-level selection, reconcile dates/profile fields, and represent explicit access grants separately from current placement. Preserve historical course access only where policy permits it.

## Learning, teaching and assessment integrity

### L01 — P1: activity answer keys leak through student lesson responses

Evidence: `backend/src/modules/content/content.service.ts:651`, `backend/src/modules/content/content.service.ts:687`, `backend/src/modules/content/assignment-config.ts`.

Student lesson detail includes entire activity records and spreads their config into the response. It does not invoke the answer sanitizer. The separate assignment-detail sanitizer only removes top-level keys; a runtime fixture confirmed that `items[0].answer` remains visible. Graded structured exercises can expose their expected answers before submission.

Correction: use explicit student DTOs for every activity endpoint, preserving public prompts/options while removing nested graded answer keys. Decide separately which self-practice activities intentionally reveal answers.

### L02 — P1: progress writes bypass lesson release/publication/payment checks

Evidence: `backend/src/modules/content/content.service.ts:704`.

Progress writes check level access and a prerequisite only when completing. They do not check publication, release dates, module availability or payment access. A student who knows a lesson ID can mark an unreleased/unpublished lesson complete and potentially unlock later content. Lesson reads also omit module publication/release and module prerequisite enforcement.

Correction: share one availability policy across reads, progress, notes and activity submission. Verify unpublished modules, future release dates, prerequisite modules and blocked financial access.

### L03 — P1: uploaded resources have login protection without level authorization

Evidence: `backend/src/modules/uploads/uploads.routes.ts`, `backend/src/modules/uploads/uploads.controller.ts`.

Any authenticated user with a file URL can download it. The download path checks safe filename/existence but has no relationship to the owning lesson, level or class. URLs are difficult to guess, but copying one bypasses level gating.

Correction: persist file ownership and authorize download against its linked learning resource. Use short-lived signed access only after authorization where appropriate.

### L04 — P1: uploaded lesson/exam audio still fails in native media elements

Evidence: `frontend/src/components/student/LessonDetail.tsx:58`, `frontend/src/components/assignments/AssessmentQuestion.tsx:15`, `frontend/src/components/assessments/QuestionTypeFields.tsx:112`.

These audio/video/image elements use the raw upload URL. The upload endpoint requires a Bearer header, which those native media requests do not attach. Relative `/api/uploads` URLs can also point at the frontend origin unless deployment/proxy routing handles them. The previous resource-list fix did not cover these players. Listening exams can therefore have unplayable uploaded audio.

Correction: use a shared authorized media resolver or signed resource URL. Verify teacher preview and student listening exam playback with a real uploaded file, seeking and mobile networks.

### L05 — P1: exam submission and attempt creation are not atomic

Evidence: `backend/src/modules/assessments/assessments.service.ts:880`, `backend/src/modules/assessments/assessments.service.ts:969`.

Starting an attempt checks counts before creating it without transaction serialization. Submitting checks IN_PROGRESS, writes answers, then changes status in separate operations without a conditional claim. Concurrent starts/submits can race, produce conflicts instead of a usable resume, or overwrite submitted answers and scores. Assessment edits are read from live question records rather than an immutable attempt snapshot.

Correction: transactionally claim start/submit and snapshot questions, points and answer keys for each attempt. Verify double clicks, two tabs, retries and teacher edits during an active exam.

### L06 — P1: manual grading allows more points than the question is worth

Evidence: `backend/src/modules/assessments/assessments.schema.ts:127`, `backend/src/modules/assessments/assessments.service.ts:668`.

The schema enforces nonnegative points only; the service never checks the question/assessment point limit. Unknown answer IDs are silently dropped. A grade can exceed the exam maximum and inflate pass results and analytics.

Correction: validate every answer ID, reject duplicates and enforce the frozen per-question maximum. Commit answer grades and the attempt total together.

### L07 — P2 / policy decision: certificate eligibility rules are incomplete

Evidence: `backend/src/modules/certificates/certificates.service.ts:17`, `backend/src/modules/certificates/certificates.service.ts:112`.

Eligibility accepts any enrolment status, requires self-reported lesson completion and, when finals exist, passing any one published final. Attendance, homework and configurable course completion requirements are not included. A supplied certificate enrollmentId is not checked here against the selected student/level. Issuance checks for an existing certificate before its transaction, which also needs concurrency protection.

Correction: define per-level completion rules, validate the linked enrolment, enforce one current issued certificate transactionally and protect eligibility from the progress bypass above. Do not assume payment clearance is a certificate requirement without an explicit policy.

### L08 — P2: coursebook availability is hardcoded to A1

Evidence: `backend/src/modules/content/coursebook.service.ts`.

The coursebook mapping contains A1 only and is code-defined. A2/B1/B2 return no coursebook. This does not prove those levels lack lessons, but coursebook parity is incomplete and adding a book requires a code change rather than CMS authoring.

Correction: move book configuration into level-specific managed resources. Separately review actual curriculum coverage, audio, exercises and CEFR learning outcomes for each level.

## Reminders, settings and operational reliability

### R01 — P2: reminder deduplication depends on visible inbox rows

Evidence: `backend/src/lib/reminders.ts:23`, `backend/src/lib/notify.ts:69`, `backend/src/modules/sessions/attendance-alerts.ts`.

Pre-class dedupe is global per session. One student's notification prevents reminders to students enrolled later. If every recipient disables in-app notifications, no inbox row exists, allowing repeated emails every hourly run. Low-attendance dedupe has the same dependency. Multiple server processes can also race the find-then-send checks.

Correction: record delivery/job keys per recipient and event independently of inbox preferences, with a unique constraint and retry state. Rescheduling should create a distinct event version.

### R02 — P2: notification topic switches and saving are inconsistent

Evidence: `backend/src/lib/notify.ts:69`, `backend/src/modules/notifications/notification-preferences.ts`, `frontend/src/components/settings/NotificationsPane.tsx:22`.

Topic switches filter email but not in-app notifications. The UI does not make this distinction clear. A save response replaces current local preferences; toggling again while a request is in flight can overwrite the newer change with the older response.

Correction: define topic/channel semantics consistently and serialize/version preference saves. Verify rapid toggles on a delayed connection.

### R03 — P2: delivery failures are not tracked or retried durably

Evidence: `backend/src/lib/notify.ts`, `backend/src/lib/mailer.ts`, `backend/src/modules/auth/auth.service.ts:268`, `backend/src/modules/payments/payments.service.ts:1071`.

Email support now exists through SMTP/relay, but failed sends are logged without a durable retry queue. With no provider configured, password reset can return a neutral success response while no recovery email is delivered. Reminder audit/result counts report selected recipients rather than successful delivery. SMS/WhatsApp still need provider implementations.

Correction: verify production provider configuration and add a delivery outbox, retry policy and operator-visible failures. Keep the public reset response neutral to avoid account enumeration, while alerting operators when recovery is unavailable.

### R04 — P2: human-readable identifiers can collide or be reused

Evidence: `backend/src/lib/ids.ts:14`, `backend/src/lib/ids.ts:20`, `backend/src/lib/ids.ts:30`.

Student/receipt/certificate identifiers use count + 1. Concurrent transactions can generate the same value and fail at the unique constraint. Deleting a receipt reduces the count, potentially generating an existing number or reusing a previously issued number.

Correction: use persistent counters/sequences or another collision-safe numbering scheme. Receipt voiding should preserve historical identifiers.

### R05 — P2: verification and architecture safeguards are incomplete

Evidence: package scripts; `frontend/eslint.config.js:29`; `backend/eslint.config.js`.

The frontend has no automated test script. Backend integration scripts exist, but should be made part of an explicit repeatable verification workflow. Frontend size-rule exemptions cover major workflows; backend has no max-lines rule despite the project-wide requirement. Passing lint therefore does not prove the stated component limit or functional completeness.

Correction: cover the scenarios above with focused API integration tests and browser flows. Split the large workflow files while correcting them; enforce the agreed limits after removing exemptions.

## Recommended implementation order

1. Establish authoritative financial obligations, currency policy and transactional balance/audit updates; fix refunds, discounts, historical attribution and numbering.
2. Enforce intake/class/enrolment consistency; wire registration/book fees and reconcile enrolment transitions.
3. Close answer leaks, release/progress bypasses and file authorization gaps; make uploaded lesson and exam media play reliably.
4. Make attempts and grading atomic, and formalize certificate eligibility.
5. Add instalment schedules, due-soon reminders and delivery records; align payment access with the agreed on-time payment policy.
6. Verify the complete student/teacher/staff flows, then audit each level's curriculum and mobile/slow-network learning experience.

Release verification should include: enrolment with all fees; last-seat concurrency; intake transfer with historical reporting; partial payments crossing due dates; currency mismatch; concurrent refunds/payments; listening exam with uploaded audio; unreleased lesson access; simultaneous exam submission; grading limits; certificate issue/revoke/reissue; reminder delivery and preference changes under slow networks.
