# Website enrollment and student account setup

The marketing site's inline form and enrollment dialog post to `POST /api/applications` with `createAccount: true` and `source: WEBSITE`.

A successful submission saves the application, creates a pending student account if the email is new, and queues a verification/password-setup email in the same database transaction. Existing accounts and passwords are never changed. A serializable transaction retries conflicts; duplicate open applications and existing emails are reused.

The account starts with no course enrollment and zero balances. Admissions continues to review the application and uses its existing account-link/enrollment action after acceptance. Its email lookup reuses the account created by the website.

The setup link goes to `/reset-password?token=…&setup=1` on `PUBLIC_APP_URL`. Only a SHA-256 token hash is stored in the token table. The email outbox temporarily holds the link until delivery. Links expire after seven days and can be consumed once; completing setup or password recovery invalidates the account's other outstanding links and sessions. No password, authentication token, student ID, or setup URL is returned from the public application endpoint.

Deploy the website, portal API, and portal frontend together. No database migration is needed. The API needs `PUBLIC_APP_URL=https://class.deutschspracherw.org` and SMTP (Hubmail) configured. The email delivery worker runs every minute, with retries. Local SMTP is disabled by default; queued messages are not proof of delivery. The website lives on `https://deutschspracherw.org`; it must be allowed by CORS. It is built into `defaultEnrollmentOrigins` in `src/config/env.ts` (with `www.` and the retired `deutshsprache.org` hosts, which now only redirect).

The portal is the website's only enrollment backend. There is no email-only fallback (the Web3Forms copy and the legacy Render `/api/enrollment/confirm` endpoint were removed on 2026-10-19). If the portal cannot be reached, the form keeps the student's answers and asks them to try again or message admissions on WhatsApp; it never shows a success message for an application the portal did not save. Admissions staff are alerted in-app (and by email, per their notification preferences) for every new application.

Verification: backend typecheck, lint and Vitest; frontend lint and production build; responsive website checks and stubbed form submission. Live email delivery is not exercised by these checks.
