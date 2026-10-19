# Production quick-test accounts

The hosted `/demo` page lists **one account for each role**: `admin`, `academic`, `finance`,
`teacher` and `student` at `@demo.sparch.rw`. All five use the demo-only password `Demo2026!`.

From `backend/`, using the intended database configuration:

```sh
node --import tsx prisma/live-demo/quick-test.ts          # preview the five identities
node --import tsx prisma/live-demo/quick-test.ts --apply  # create/update only those five users
```

The quick-test seed runs in a transaction. It preserves real users, level settings and curriculum.
It creates one `DEMO-QUICK-A1` class, assigns the demo teacher to A1–B2, and gives the single demo
student fee-waived enrolments in all four levels. It calls the shared finance calculator and
writes an audit row. Re-running preserves existing demo progress, payments and enrolments.
It refuses to run while other demo-domain accounts exist; inspect those before choosing a cleanup.

`run.ts` is the older, richer **15-account** scenario dataset. It is not the one-account-per-role
quick-test seed. Do not use the ordinary `db:seed` against production.

Back up production before applying changes. `LIVE_DEMO_CONFIRM=yes node --import tsx
prisma/live-demo/run.ts --reset-only` removes demo-domain accounts and their linked demo dataset;
inspect for real users or work linked to demo records before running that cleanup.
