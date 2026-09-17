# AGENTS.md — Sparch Duetsch Rwanda (Deutsch Sprache RW E-Learning)

`frontend/` is a Vite + React 19 app with real routes/pages (student, auth, admin). `backend/` is a working Express + TypeScript + Prisma + PostgreSQL API (**Phase 1 MVP complete**). Phase 2+ work follows the build order at the bottom.

## Layout & entrypoints

- `frontend/src/main.tsx` (BrowserRouter, `initTheme()`) → `App.tsx` (lazy-loaded routes: `/dashboard`, `/courses`, `/courses/:slug`, `/courses/:slug/learn`, `/schedule`, `/instructors`, `/messages`, `/activity`, `/profile`, `/settings`, `/login`, `/register`, `/verify/:code`, `/teacher/*`, `/admin/*`), `index.css`. `src/lib/api.ts` is the only axios instance; `src/lib/auth-store.ts` owns tokens; `src/components/layout/RouteProgress.tsx` drives NProgress on navigation. Teacher adds `/teacher/classes/:classGroupId/people` (roster drill-down) and `/teacher/reports` (class-filtered analytics).
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

- Tailwind v4 via `@tailwindcss/vite` plugin, not v3 config: `src/index.css` uses `@import "tailwindcss";` + `@plugin "daisyui"` (light default plus dark, cupcake, bumblebee, emerald, corporate, synthwave, retro, valentine, aqua, night, winter) + a `@plugin "daisyui/theme"` light token block. Keep this; add themes only inside that block. Radius is token-driven (`--radius-selector/field/box` + `--radius-nav/card/panel/modal/input/pill` aliases in `@theme`); shadows stay flat per client request (`card-shadow` ≈ hairline).
- Stack: React 19, Vite 7, `typescript ~5.9`, `verbatimModuleSyntax: true` (use `import type`), `erasableSyntaxOnly: true` (no enums/namespaces), `noUnusedLocals`/`noUnusedParameters: true`, `jsx: react-jsx`, `moduleResolution: bundler`.
- Router: `react-router-dom` v7 (BrowserRouter in `main.tsx`). Data/fetch: `axios` (single instance in `src/lib/api.ts`, base URL from `VITE_API_URL`, Bearer access token + refresh retry). Progress: `nprogress` driven by `RouteProgress.tsx` on every pathname change (plus Suspense fallback). Charts: `recharts`; utils: `date-fns`, `react-icons`. No global state library yet — propose before adding one.
- API envelope: backend returns `{ success: true, data }` or paginated `{ success: true, ...buildPaginated(...) }`. Always unwrap `data` in `api.ts` helpers, never in pages. Tokens live only in `auth-store.ts` (localStorage `sparch.accessToken` / `sparch.refreshToken`).
- **Role portals (do not regress):** three login routes — `/login` (student), `/login/teacher`, `/login/staff` — share `pages/auth/LoginForm.tsx`; a wrong-portal login is rejected and linked to the right portal. `lib/roles.ts` is the single source for role groups + `homePath` (STUDENT→`/dashboard`, TEACHER→`/teacher`, ACADEMIC/SUPER→`/admin`, FINANCE→`/admin/finance`). `App.tsx` guards every group with `RequireRole` (redirects to the user's own home, never a 403), and `/` resolves through `RoleHome`. `lib/session.tsx` (`SessionProvider`/`useSession`) loads `/auth/me` once for guards, nav and topbar. `lib/nav.ts` is keyed by the real backend role so the sidebar never links to an endpoint that role cannot call. Add a page only inside the role group whose endpoints it uses, or make it role-aware (e.g. `AdminStudents` hides placement for finance).
- **Role capabilities (keep in sync with the API):** _Teacher_ owns classes + curriculum for the levels they teach (`/teacher/content`, `/teacher/assessments`, `/teacher/schedule` create, `/teacher/attendance`, `/teacher/grading`, `/teacher/reports`, `/teacher/classes/:classGroupId/people`) — `content.service`/`sessions.service` enforce level/class ownership via `assertCanManageLevel`/`assertTeacherIfNeeded`. Teacher dashboard is Canvas-style: `ClassGroupCard` + `TodoRail` (`components/teacher/`), drill ClassGroup → People (search/status filter/bulk message via `messages` API) → Grading (Gradebook + SpeedGrader, both filtered by ClassGroup via `GET /assessments/attempts?classGroupId=`). _Academic admin_ owns people, classes, enrolments, organisation, announcements, curriculum and certificates, and **must not surface finance figures** (the academic dashboard shows academic KPIs only; payments live under `/admin/finance` + `/admin/transactions`, finance roles only). Shared curriculum authoring lives in `components/curriculum/CurriculumManager.tsx` (split into `constants.ts`/`types.ts`/`utils.ts`/`hooks/useLessonCache.ts`); the API returns lessons inside `GET /content/levels/:levelId/modules`.
- **Decomposed feature folders (keep the pattern):** `components/{activity,assessments,attendance,grading,messaging,reports,schedule,settings,teacher}/` each hold single-responsibility components + `constants.ts`/`utils.ts`; pages stay thin. Shared `/settings` page (profile via `PATCH /auth/me`, security, appearance via `lib/theme-store.ts` + `initTheme()`, notifications) is mounted once for every authenticated role. `useApi` exposes `fetching` (background refetch) alongside `loading` (first paint) so polling views never flash. Design spec + plan live in `docs/superpowers/specs/2026-09-14-teacher-dashboard-canvas-design.md` and `docs/superpowers/plans/2026-09-14-teacher-dashboard-plan.md`.

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
- Profile self-service: `PATCH /auth/me` (`updateProfileSchema`: firstName/lastName/phone/avatarUrl, audited as `PROFILE_UPDATED`) — used by the shared Settings page; avatar surfaces on `AuthUser.avatarUrl` and the activity feed (`actorAvatarUrl` on `GET /activity/feed`).
- Teacher cohort filter: `GET /assessments/attempts` (+ export) accepts optional `classGroupId`, resolved server-side to enrolled studentIds — the only backend change the teacher Canvas redesign required. Class detail (`GET /classes/:id`) includes level/intake/campus objects plus enrollment rows with user ids for the People drill-down.
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
| `/api/users`         | `modules/users`         | staff accounts + roles (`GET /teachers` is open to any signed-in user) |
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

### Component architecture (STRICT — do not bypass)

- **Hard limit: 200 lines per file.** No `*.ts` / `*.tsx` file may exceed 200 lines. Soft target is 120–150. CI (`npm run lint`) enforces this via `max-lines`.
- **One component / one responsibility per file.** If a file grows past ~150 lines, split it: extract sub-components (`components/curriculum/ModuleCard.tsx`), hooks (`hooks/useLessonCache.ts`), constants (`constants.ts`), types (`types.ts`), and utils. Co-locate by feature, not by type.
- **No god components.** `CurriculumManager`, `services.ts`, `mock.ts` and similar aggregators must be decomposed into feature folders. New code that pushes a file over 200 lines must be refactored before merge.
- **Shared logic lives in hooks/utils, not in parent state.** Prefer small, testable hooks over prop drilling through a 1000-line parent.
- **Verification:** run `npm run lint` locally — it will fail with `max-lines` if you violate this. Fix by splitting, not by disabling the rule.

## Mobile / low-bandwidth (primary UX is phones on slow networks)

- Mobile-first layouts; key nav: Dashboard, My Course, Notes, Exercises, Exams, Attendance, Payments, Notifications, Profile.
- Prefer text/audio, compress media, adaptive video, searchable + downloadable notes/audio where permitted. Live-class essential info (link, time, teacher) must render even when other media fails.

## Build order (MVP first)

1. **✅ Done (backend):** Auth, registration, A1–B2 structure, lessons/notes/video/audio, dashboards (student/teacher/academic/finance/management), payment tracking, attendance, quizzes + question bank, skill analytics, certificates module/API (issue/revoke/reissue, eligibility, public verify, PDF+QR).
2. **✅ Done (frontend):** Canvas-style teacher dashboard (ClassGroup cards + To-Do rail), People drill-down per class, Gradebook + SpeedGrader filtered by ClassGroup, class-filtered Reports, shared Settings (profile/security/appearance/notifications), messaging/activity decomposition.
3. **Next:** Assignments depth, notification providers beyond IN_APP (email/SMS/WhatsApp are still log-driver only), password-reset email delivery (token returned in dev only), payment gateways (manual records only).
4. **Later:** Gateways, automated receipts/reminders, multi-campus finance, discounts.
5. **Later:** PWA/mobile, AI practice, integrations, personalization.

Remaining gaps: password-reset email delivery (token is returned in dev only), notification providers beyond `IN_APP` (log driver only), payment gateways (manual records only). Frontend is fully wired to this API. Certificates, chat, activity feed, articles/FAQs, exports, reminders, skills, uploads and PWA are all implemented (see module map above).
