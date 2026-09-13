# AGENTS.md — Sparch Duetsch Rwanda (Deutsch Sprache RW E-Learning)

Greenfield repo. `frontend/` is a Vite scaffold; `backend/` is empty (`.gitkeep` only). Follow the Phase 1 MVP order below; do not scaffold everything at once.

## Layout & entrypoints

- `frontend/src/main.tsx` → `App.tsx` (currently empty placeholder), `index.css`.
- `backend/` has no code yet — new Express + TypeScript API goes here (see `express-typescript` skill in `.agents/skills/`).
- UI components must use the `daisyui` skill in `.agents/skills/`. No other component library.

## Commands (run in `frontend/`; no root scripts, no tests yet)

- `npm run dev` — Vite dev server.
- `npm run build` — always `tsc -b && vite build`; fix TS errors before debugging Vite output.
- `npm run lint` — `eslint .` (`dist/` is globally ignored).
- `npm run preview` — serve a production build locally.

## Frontend quirks (verified, do not change pattern)

- Tailwind v4 via `@tailwindcss/vite` plugin, not v3 config: `src/index.css` uses `@import "tailwindcss";` + `@plugin "daisyui" { themes: light --default; }`. Keep this; add themes only inside that block.
- Stack: React 19, Vite 7, `typescript ~5.9`, `verbatimModuleSyntax: true` (use `import type`), `erasableSyntaxOnly: true` (no enums/namespaces), `noUnusedLocals`/`noUnusedParameters: true`, `jsx: react-jsx`, `moduleResolution: bundler`.
- No router, state, or fetch library installed yet. Propose before adding one.

## Domain rules (Deutsch Sprache RW — agent will get these wrong)

- **Level-specific, never generic:** A1/A2/B1/B2 each need their own curriculum, notes, vocab, grammar, activities, assessments. Do NOT build one course page with a swapped title. Gate content: student sees only enrolled level unless teacher/admin grants access.
- **Payment-aware but separate:** every student has a financial profile (total due / paid / balance / history + receipts). Academic progress and payment status stay separate fields, shown together. Statuses: `Unpaid, Partially Paid, Fully Paid, Overdue, Waived, Refunded`. Support installments + partial payments with auto balance; discounts with reason/approval; MTN MoMo / Airtel Money / bank / card / cash as configurable methods. Never store card data. Log all payment edits/deletions/refunds (who, when, reason).
- **Roles (least privilege):** Student / Teacher / Academic-Admin / Finance-Admin / Super Admin. Finance must not get academic/system access by default; teachers only assigned classes; students only enrolled level.
- **Account + attendance statuses are closed sets:** account `Active, Pending, Suspended, Completed, Withdrawn, Graduated`; attendance `Present, Absent, Late, Excused` per session with configurable low-attendance alerts.
- **Live classes:** store external Meet/Zoom link + timezone + `Scheduled, Live, Completed, Cancelled, Rescheduled` status + optional recording link. Same level/class permission as other content. Never rebuild video conferencing; keep join view lightweight for mobile networks.
- **Certificates:** only on configured completion/pass rules; each gets unique number and/or QR + public verification page + PDF download; admin can issue/revoke/reissue with audit.
- **Student identity:** auto-generate unique student ID at registration (name, phone, email, campus, shift, intake, intended level; placement test recommends level, admin can override).

## Architecture constraints

- Model as separate linked records from day one: users, students, levels/courses, intakes, enrollments (student+level+intake+campus+class), modules/lessons/activities, assessments/attempts, attendance, payments, certificates, notifications, audit logs. Keep levels/campuses configurable so non-German courses and new branches work without schema rewrites.
- Keep CMS (Level → Module → Lesson → Activity → Assessment, scheduling/prerequisite release) separate from the student learning view so content edits never need a redeploy.
- Design APIs for future mobile app, payment gateways, WhatsApp/SMS, calendar (Google/Outlook) integrations.

## Mobile / low-bandwidth (primary UX is phones on slow networks)

- Mobile-first layouts; key nav: Dashboard, My Course, Notes, Exercises, Exams, Attendance, Payments, Notifications, Profile.
- Prefer text/audio, compress media, adaptive video, searchable + downloadable notes/audio where permitted. Live-class essential info (link, time, teacher) must render even when other media fails.

## Build order (MVP first)

1. Auth, registration, A1–B2 structure, lessons/notes/video/audio, 3 dashboards, payment tracking, attendance, basic quizzes.
2. Assignments, question bank, skill analytics, certificates, reports, notifications.
3. Gateways, automated receipts/reminders, multi-campus finance, discounts.
4. PWA/mobile, AI practice, integrations, personalization.
