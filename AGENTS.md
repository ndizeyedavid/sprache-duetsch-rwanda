# AGENTS.md — Sparch Duetsch Rwanda (Deutsch Sprache RW E-Learning)

`frontend/` is a Vite + React 19 app with real routes/pages (student, auth, admin). `backend/` is a working Express + TypeScript + Prisma + PostgreSQL API (**Phase 1 MVP complete**). Phase 2+ work follows the build order at the bottom.

## Layout & entrypoints

- `frontend/src/main.tsx` (BrowserRouter) → `App.tsx` (lazy-loaded routes: `/dashboard`, `/courses`, `/courses/:slug`, `/courses/:slug/learn`, `/schedule`, `/instructors`, `/messages`, `/activity`, `/profile`, `/login`, `/register`, `/admin/*`), `index.css`. `src/lib/api.ts` is the only axios instance; `src/lib/auth-store.ts` owns tokens; `src/components/layout/RouteProgress.tsx` drives NProgress on navigation.
- `backend/src/server.ts` → `app.ts` → `routes.ts` (mounts every module router under `/api`). Entrypoints below.
- UI components must use the `daisyui` skill in `.agents/skills/`. No other component library.
- Backend follows the `express-typescript` skill in `.agents/skills/`.

### Backend entrypoints

- `src/server.ts` — listen + graceful shutdown; `src/app.ts` — helmet/cors/compression/JSON/cookies/pino-http/rate-limit + error handler; `src/routes.ts` — `apiRouter` (mounted at `/api`), `/health` included.
- `src/config/env.ts` — the only place `process.env` is read (Zod-validated).
- `src/lib/prisma.ts` — `PrismaClient` with the `@prisma/adapter-pg` driver adapter.
- `prisma/schema.prisma` — domain model (31 models / 25 enums); `prisma/seed.ts` — idempotent demo seed.
- Generated client lives at `src/generated/prisma` and is **gitignored** — run `npm run db:generate` after a fresh clone.

## Commands

### `frontend/`

- `npm run dev` — Vite dev server.
- `npm run build` — always `tsc -b && vite build`; fix TS errors before debugging Vite output.
- `npm run lint` — `eslint .` (`dist/` is globally ignored).
- `npm run preview` — serve a production build locally.

### `backend/`

- `npm run dev` — `tsx watch src/server.ts` (API on `http://localhost:4000/api`).
- `npm run typecheck` / `npm run lint` — must both exit 0 before pushing.
- `npm run build` → `npm start` — compile to `dist/` and run.
- `npm run db:generate` — regenerate the Prisma client after schema edits.
- `npm run db:migrate` — create/apply a dev migration; `npm run db:deploy` applies existing ones.
- `npm run db:seed` — reseed (safe to re-run); `npm run db:reset` — wipe + re-migrate + reseed; `npm run db:studio` — browse data.
- `npm run test` — Vitest (no tests written yet).

**Local database (no Docker needed):** PostgreSQL 17 runs natively. `DATABASE_URL=postgresql://sparch:sparch_dev@localhost:5432/sparch_rw?schema=public` in `backend/.env`. `psql.exe` lives at `C:\Program Files\PostgreSQL\17\bin\psql.exe` (not on PATH). `docker-compose.yml` exists but is unused.

**Seeded logins (dev only):** `admin@sparch.rw` / `Admin123!` (Super Admin), `academic@sparch.rw` / `Academic123!`, `finance@sparch.rw` / `Finance123!`, `clarisse@sparch.rw` / `Teacher123!`, `nella@student.sparch.rw` / `Student123!`.

## Frontend quirks (verified, do not change pattern)

- Tailwind v4 via `@tailwindcss/vite` plugin, not v3 config: `src/index.css` uses `@import "tailwindcss";` + `@plugin "daisyui" { themes: light --default; }`. Keep this; add themes only inside that block.
- Stack: React 19, Vite 7, `typescript ~5.9`, `verbatimModuleSyntax: true` (use `import type`), `erasableSyntaxOnly: true` (no enums/namespaces), `noUnusedLocals`/`noUnusedParameters: true`, `jsx: react-jsx`, `moduleResolution: bundler`.
- Router: `react-router-dom` v7 (BrowserRouter in `main.tsx`). Data/fetch: `axios` (single instance in `src/lib/api.ts`, base URL from `VITE_API_URL`, Bearer access token + refresh retry). Progress: `nprogress` driven by `RouteProgress.tsx` on every pathname change (plus Suspense fallback). Charts: `recharts`; utils: `date-fns`, `react-icons`. No global state library yet — propose before adding one.
- API envelope: backend returns `{ success: true, data }` or paginated `{ success: true, ...buildPaginated(...) }`. Always unwrap `data` in `api.ts` helpers, never in pages. Tokens live only in `auth-store.ts` (localStorage `sparch.accessToken` / `sparch.refreshToken`).

## Backend quirks (verified, do not change pattern)

- **Prisma 7 is Rust-free and needs a driver adapter.** `src/lib/prisma.ts` builds `new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) })`. The CLI reads `prisma7.config.ts` (**not** `prisma.config.ts`) — `migrations.seed` there is what makes `prisma db seed` work.
- The `prisma-client` generator **requires `output`** → `src/generated/prisma` (gitignored). Import types/enums from `src/generated/prisma/client.js`.
- ESM + `NodeNext` + `verbatimModuleSyntax`: **every relative import needs the `.js` extension**, and type-only imports must use `import type`.
- ESM interop: `jsonwebtoken` is CJS — use `import jwt from "jsonwebtoken"` + `jwt.sign`/`jwt.verify`, never named imports.
- `erasableSyntaxOnly`: no TS `enum`, no namespaces. Enums come from Prisma; shared role groups live in `src/lib/roles.ts`.
- Each module is `x.schema.ts` (Zod) → `x.service.ts` (Prisma) → `x.controller.ts` (thin handlers) → `x.routes.ts` (exported router). Adding a module means: create the folder, then mount it in `src/routes.ts`.
- Validation goes through `validate({ body, query, params })`; controllers read values with `validatedBody/validatedQuery/validatedParams` from `src/lib/request.ts`.
- Responses are enveloped: `{ success: true, data }` or `{ success: true, ...buildPaginated(...) }`. Errors are thrown as `AppError` helpers from `src/lib/http-error.ts`.
- Access control: `requireAuth` + `requireRole(...GROUPS)` middleware inside each router. Student scope is enforced by `src/lib/access.ts` (`assertLevelAccess`, `assertPaymentAccess`, `assertTeacherOwnsClass`).
- **Money is `Prisma.Decimal`, never JS floats.** Balances have one writer only: `recalculateStudentFinance(client, studentId)` in `src/lib/finance.ts`. Any charge/discount/payment/refund mutation must call it.
- Admin/finance mutations write an audit row via `writeAudit` (`src/lib/audit.ts`). Never store card data.
- `src/lib/query.ts` holds the shared query validators (`paginationQuery`, `booleanQuery`, `idParam`) — reuse instead of re-declaring.
- `tsconfig.json` covers `src/` only (the build). `tsconfig.eslint.json` adds `prisma/**` + `prisma7.config.ts` for typed linting — update it if you add root-level TS.

### Backend module map (all mounted in `src/routes.ts`)

| Mount                | Folder                  | Purpose                                                             |
| -------------------- | ----------------------- | ------------------------------------------------------------------- |
| `/api/auth`          | `modules/auth`          | register, login, refresh, logout, me, password reset/change         |
| `/api/campuses`      | `modules/campuses`      | campuses (reference module — copy this shape)                       |
| `/api/levels`        | `modules/levels`        | A1–B2 + specialised levels                                          |
| `/api/intakes`       | `modules/intakes`       | intakes / academic periods                                          |
| `/api/classes`       | `modules/classes`       | class groups + roster                                               |
| `/api/users`         | `modules/users`         | staff accounts + roles                                              |
| `/api/students`      | `modules/students`      | profiles, placement, own progress/attendance                        |
| `/api/enrollments`   | `modules/enrollments`   | student + level + intake + class + tuition charge                   |
| `/api/content`       | `modules/content`       | CMS (modules/lessons/materials/activities) + student learning views |
| `/api/assessments`   | `modules/assessments`   | question bank, assessments, attempts, grading                       |
| `/api/sessions`      | `modules/sessions`      | live classes, scheduling, materials, roster                         |
| `/api/attendance`    | `modules/sessions`      | same folder exports `attendanceRouter`                              |
| `/api/payments`      | `modules/payments`      | methods, charges, discounts, payments, refunds, receipts, reports   |
| `/api/dashboards`    | `modules/dashboards`    | student / teacher / academic / finance / management KPIs            |
| `/api/notifications` | `modules/notifications` | inbox, read state (`readAt`), announcements                         |
| `/api/messages`      | `modules/messages`      | DM threads (participants, unread counts), send, read, contacts      |
| `/api/activity`      | `modules/activity`      | live feed (`GET /feed`, scoped) + staff posts; emitters in enrollments/assessments/payments/sessions |
| `/api/articles`      | `modules/articles`      | public articles (`/articles`, `/articles/:slug`) + FAQs; academic CRUD |
| `/api/certificates`  | `modules/certificates`  | issue/revoke/reissue + eligibility check, `GET /my`, public `/verify/:code`, PDF (`/:id/pdf`, pdfkit + QR) |
| `/api/uploads`       | `modules/uploads`       | staff file upload (multer, 25 MB, allowlist) + authed download; `./uploads` gitignored |

CSV/PDF exports live in their modules via `src/lib/csv.ts` (`sendCsv`): `GET /students/export`, `/payments/export`, `/assessments/attempts/export`, `/attendance/export`; receipt PDF at `GET /payments/receipts/:id/pdf`. Skill analytics: `GET /assessments/my/skills` + `GET /assessments/skills?studentId=`. Lesson/assessment prerequisites are **blocking** (403 until prerequisite lesson is COMPLETED). `src/lib/notify.ts` is the single notification fan-out (IN_APP persisted; other channels log-driver until provider keys exist). `src/lib/reminders.ts` runs node-cron jobs from `server.ts` (overdue daily 08:00, pre-class hourly; `REMINDERS_ENABLED=false` disables). Frontend is a PWA (`vite-plugin-pwa`, app-shell precache + image cache; API never cached).

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

1. **✅ Done (backend):** Auth, registration, A1–B2 structure, lessons/notes/video/audio, dashboards (student/academic/finance/management), payment tracking, attendance, basic quizzes.
2. **Next:** Assignments, question bank depth, skill analytics, certificates (schema exists, no module/API yet), reports, notifications delivery (email/SMS/WhatsApp are still in-app only).
3. **Later:** Gateways, automated receipts/reminders, multi-campus finance, discounts.
4. **Later:** PWA/mobile, AI practice, integrations, personalization.

Remaining gaps: password-reset email delivery (token is returned in dev only), notification providers beyond `IN_APP` (log driver only), payment gateways (manual records only). Frontend is fully wired to this API. Certificates, chat, activity feed, articles/FAQs, exports, reminders, skills, uploads and PWA are all implemented (see module map above).
