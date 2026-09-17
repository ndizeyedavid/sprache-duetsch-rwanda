# Sparch Duetsch Rwanda

E-learning platform for **Deutsch Sprache RW** — level-based German courses (A1–B2) with live classes, assessments, attendance, payments, and certificates.

## Stack

- **Frontend** (`frontend/`): Vite + React 19 + TypeScript + Tailwind v4 + daisyUI. Mobile-first, PWA-enabled.
- **Backend** (`backend/`): Express + TypeScript + Prisma 7 + PostgreSQL 17. Enveloped JSON API under `/api`.
- **Database**: PostgreSQL 17 (native, no Docker needed for local dev).

## Quickstart

```bash
# Backend
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev        # API on http://localhost:4000/api

# Frontend (second terminal)
cd frontend
npm install
npm run dev
```

Seeded dev logins: `admin@sparch.rw` / `Admin123!` (Super Admin), `academic@sparch.rw` / `Academic123!`, `finance@sparch.rw` / `Finance123!`, `clarisse@sparch.rw` / `Teacher123!`, `nella@student.sparch.rw` / `Student123!`.

Local DB: `DATABASE_URL=postgresql://localhost:5432/sparch_rw?schema=public` in `backend/.env`.

## Roles & portals

Three login portals share one form: `/login` (student), `/login/teacher`, `/login/staff`. Homes: student → `/dashboard`, teacher → `/teacher`, academic/super → `/admin`, finance → `/admin/finance`. Guards redirect to your own home — never a 403.

## Highlights

- **Teacher workspace (Canvas-style)**: ClassGroup cards + To-Do rail, People roster drill-down per class (`/teacher/classes/:classGroupId/people`), Gradebook + SpeedGrader filtered by ClassGroup, class-filtered Reports.
- **Learning CMS**: Level → Module → Lesson → Activity → Assessment with prerequisite gating, separate from the student learning view.
- **Payments**: charges, installments, partial payments, discounts with approval, MTN MoMo / Airtel / bank / card / cash methods, receipts + PDF. Academic progress and payment status stay separate.
- **Certificates**: completion/pass rules, unique number + QR, public verification (`/verify/:code`), PDF download, issue/revoke/reissue with audit.
- **Shared Settings** (`/settings`): profile (`PATCH /auth/me`), password, appearance (12 daisyUI themes), notifications.

## Repo map

| Path | Purpose |
| ---- | ------- |
| `frontend/src` | Routes, role-grouped pages, feature component folders, `lib/services.ts` API helpers |
| `backend/src` | `server.ts` → `app.ts` → `routes.ts`; one folder per module (`schema` → `service` → `controller` → `routes`) |
| `backend/prisma` | Schema (31 models) + idempotent seed |
| `docs/superpowers` | Feature specs + implementation plans |
| `AGENTS.md` | Agent working rules — read this before changing code |

## Checks before pushing

```bash
cd frontend && npm run lint        # enforces 200-line file limit
cd backend && npm run typecheck && npm run lint
```
