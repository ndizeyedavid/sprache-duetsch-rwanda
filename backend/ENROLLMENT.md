# Website enrollment and student account setup

The marketing site's inline form and enrollment dialog post to `POST /api/applications` with `createAccount: true` and `source: WEBSITE`.

A successful submission saves the application, creates a pending student account if the email is new, and queues a verification/password-setup email in the same database transaction. Existing accounts and passwords are never changed. A serializable transaction retries conflicts; duplicate open applications and existing emails are reused.

The account starts with no course enrollment and zero balances. Admissions continues to review the application and uses its existing account-link/enrollment action after acceptance. Its email lookup reuses the account created by the website.

The setup link goes to `/reset-password?token=…&setup=1` on `PUBLIC_APP_URL`. Only a SHA-256 token hash is stored in the token table. The email outbox temporarily holds the link until delivery. Links expire after seven days and can be consumed once; completing setup or password recovery invalidates the account's other outstanding links and sessions. No password, authentication token, student ID, or setup URL is returned from the public application endpoint.

Deploy the website, portal API, and portal frontend together. No database migration is needed. The API needs `PUBLIC_APP_URL=https://class.deutschspracherw.org` and its existing SMTP or email relay configuration. The email delivery worker runs every minute, with retries. Local SMTP is disabled by default; queued messages are not proof of delivery. The website lives on `https://deutschspracherw.org` (and `www.`); both must be allowed by CORS, together with the retired `https://deutshsprache.org` / `www.` hostnames that still serve the same site. They are built into `defaultEnrollmentOrigins` in `src/config/env.ts`.

If the website cannot reach the portal, its existing email-only fallback still forwards the request to admissions. Its success message clearly says portal account setup is pending. It never claims an account was created by the fallback.

Verification: backend typecheck, lint and Vitest; frontend lint and production build; responsive website checks and stubbed form submission. Live email delivery is not exercised by these checks.
