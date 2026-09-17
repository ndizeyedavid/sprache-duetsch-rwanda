# Teacher Dashboard — Canvas-Faithful Redesign

**Date:** 2026-09-14
**Status:** Draft → Awaiting review
**Author:** Muse Spark + Digne
**Scope:** Teacher role, Dashboard iteration 1. Student dashboard is the next spec.

## 1. Vision & Scope

Give teachers the Canvas navigation superpower: **Course → Section → Student in two clicks**, mapped to Sparch's **Level → ClassGroup → Student**. A teacher who owns 3 ClassGroups should spot which class needs attention in under 5 seconds, open its roster in one click, and jump to its ungraded work already filtered.

**In scope (this spec):**
- ClassGroup as Canvas Course Card (color, nickname, enrollment count, unread dots).
- Dashboard To-Do (Needs Grading + Attendance to mark) + Needs Grading summary + Coming Up.
- People drill-down per ClassGroup (search, filter, bulk message, per-student shortcuts).
- SpeedGrader analogue + Gradebook table, both filtered by ClassGroup.

**Out of scope (deferred):**
- Student dashboard Canvas pass (next spec).
- Card drag-to-reorder, SIS Imports, per-card Announcements/Discussions/Files tabs.
- Calendar sync (Google/Outlook), LTI placements.
- Bulk CSV import for groups.

**Success criteria:**
- Teacher with 3 ClassGroups completes: Dashboard → open A2 Evening roster → open first ungraded submission, filtered to that ClassGroup, in ≤3 clicks and no manual filter typing.
- No 403s: every nav entry maps to an endpoint the teacher role can call; filters only show the teacher's own ClassGroups.

## 2. Canvas Inspiration — What We're Borrowing

| Canvas pattern | Sparch mapping | What we keep |
|---|---|---|
| Course Card Dashboard (cards with color, nickname, enrollment, quick tabs) | ClassGroup Card (Level badge A1–B2, Intake term, Campus, student count) | Color strip synced to Calendar, nickname stored in localStorage (per-teacher, per-ClassGroup), hide/unfavorite for archived classes, unread dot for Needs Grading |
| Dashboard Sidebar: To-Do + Needs Grading + Coming Up | Same three, but Sparch-flavored: To-Do aggregates across ClassGroups, Needs Grading groups by ClassGroup, Coming Up = next 3 live sessions for your classes | Clicking a To-Do item jumps to the correct filtered view, not a generic list |
| People → filter by Section/Role, search, bulk message, assign to Groups | People → filter by ClassGroup (Section switcher), AccountStatus, search by name/ID, bulk message, per-row shortcuts | Enforce teacher ownership: teacher only sees students in their own ClassGroups |
| Gradebook filtered by Section, SpeedGrader filtered by Section/Group, Next/Prev per student | Gradebook table (students × assessments) filtered by ClassGroup; SpeedGrader focus view (one submission, Prev/Next within the filtered ClassGroup, rubric + comment) | Section filter persists across Gradebook ↔ SpeedGrader; large cohorts (80 students) load in 20-student slices for performance |

Canvas docs references: Card View Dashboard, People Sections/Groups, SpeedGrader filtered by Section, Gradebook section filters (2024–2025 release notes).

## 3. Dashboard Layout

```
+-- Header ----------------------------------------------------------+
| Level chips [A1 A2 B1 B2] · Campus dropdown · Intake dropdown     |
+-------------------------------------------------------------------+
| Left (70%): ClassGroup Cards grid        | Right rail (30%)       |
| [ A2 Eve - Remera  · 22 students · •4 ] | To-Do                  |
| [ B1 Morn - Nyamirambo · 18 · •0 ]      |  • Grade 4 — A2 Eve   |
| [ A1 Eve - Huye · 15 · •2 ]             |  • Mark att — B1 Morn |
|                                          | Needs Grading (by class)|
|                                          | Coming Up (3 sessions) |
+-------------------------------------------------------------------+
```

- **Cards:** 2–3 per row on desktop, stacked on mobile. Top color strip. Clicking the card body opens People for that ClassGroup; the two small buttons on the card are shortcuts: People and SpeedGrader (Needs Grading filtered to that ClassGroup).
- **To-Do:** Ordered by urgency — attendance for past sessions first (missed marks), then nearest-due ungraded. Max 5 items; "View all" links to full Attendance or Grading.
- **Filters:** Header chips are multi-select; filtering cards also filters the To-Do counts (so the dashboard always answers "what needs attention *in the filtered cohorts*").
- **Empty states:** "No classes assigned yet — contact your academic admin" with a clear icon, not a 403.

## 4. People & Cohort Navigation

Entry: Click a ClassGroup Card → `/teacher/classes/:classGroupId/people` (dedicated page, not an overlay — keeps browser history and deep-links clean).

**Roster table columns:** Student | Student ID | Status (Active/Pending) | Attendance % (for that ClassGroup) | Last submission | Actions (View profile · Mark attendance · Grade in SpeedGrader).

**Controls:**
- Search (name / student ID, debounced).
- AccountStatus filter (Active / Pending / All).
- Sort by name / submission date / attendance %.
- Bulk message (select 1..N → compose → send to those userIds).
- Section switcher dropdown at top (lists the teacher's other ClassGroups) so they can flip cohorts without returning to the dashboard.

**Performance note from Canvas:** SpeedGrader and Gradebook load slowly with 80+ students; filtering by Section keeps batches small. We mirror this: all roster exports and Gradebook queries are paginated/filtered by ClassGroup from the first call.

## 5. Grading Flow (Gradebook + SpeedGrader)

Two views, same filtered cohort:

1. **Gradebook table:** Rows = students in the selected ClassGroup, Cols = assessments for that Level (paginated, 8–12 cols visible). Cells show score/badge (Graded / Submitted / Missing). Inline click edits points + feedback; save batches per row.
2. **SpeedGrader focus:** One submission at a time — prompt, student response, rubric, points field, comment, Prev/Next within the filtered ClassGroup. Header shows "Student 3 of 22 — A2 Evening Remera". A "View in Gradebook" link returns to the filtered Gradebook.

Navigation: Dashboard To-Do "Grade 4 — A2 Eve" → SpeedGrader already filtered to those 4 ungraded for that ClassGroup.

## 6. Data & API

Existing endpoints we reuse (verified mapped to Sparch schema):
- `GET /classes?teacherId=me` → teacher's ClassGroups.
- `GET /content/levels/:levelId/modules` (includes lessons) and `GET /content/lessons/:id`.
- `GET /assessments/questions` + `POST /assessments/questions`.
- `GET /assessments/assessments` + `POST /assessments/assessments` + `PUT /assessments/assessments/:id/questions`.
- `GET /assessments/attempts?status=SUBMITTED&classGroupId=:id` (needs ClassGroup filter addition — see below).
- `GET /assessments/attempts/:id` (detail) + `POST /assessments/attempts/:id/grade`.
- `GET /sessions?classGroupId=:id` + `POST /sessions` + `GET /sessions/:id/roster` + `POST /sessions/:id/attendance`.

**Small API additions required for Canvas-faithful filtering:**
- Add optional `classGroupId` filter to `GET /assessments/attempts` (server resolves to the Level's students vs. that ClassGroup's enrollments; indexed).
- Dashboard To-Do aggregation: either a new `GET /dashboards/teacher/todo?classGroupId=` or compose on the client from existing `/assessments/attempts?status=SUBMITTED` + `GET /sessions?status=SCHEDULED` — implementation plan will pick the cheaper path.

**Client state:** `useApi` with `enabled` guard (already fixed for empty-id fetches); add a `dashboardFilters` context so ClassGroup selection persists across Dashboard → People → Grading.

## 7. Components (new or changed)

- `components/teacher/ClassGroupCard.tsx` (new) — color strip, badge, counts, unread dot, two quick actions.
- `components/teacher/TodoRail.tsx` (new) — To-Do + Needs Grading + Coming Up, each item deep-links with prefilled filters.
- `pages/teacher/Dashboard.tsx` (rewrite) — 70/30 layout with header filters + cards + rail.
- `pages/teacher/People.tsx` (new) — roster table + Section switcher + bulk message.
- `pages/teacher/Grading.tsx` → split into `GradebookTable.tsx` + `SpeedGrader.tsx` (new) sharing the same filter context.
- `lib/session.tsx` already provides role; add `useDashboardFilters()` context.

## 8. Risks & Mitigations

- **Heavy dashboard = slow first paint:** Lazy-load the Gradebook; fetch cards first, then To-Do in parallel; paginate Gradebook cols.
- **Teacher with zero ClassGroups (unassigned):** Show the empty-state early; do not call filtered endpoints with empty ids (the `enabled` guard pattern we just introduced).
- **Canvas expectations vs. Sparch constraints:** Canvas has SIS/terms; Sparch has Intake/Campus. We keep the Intake/Campus filters but do not add a Term abstraction now — would require a schema migration.

## 9. Out-of-Scope Follow-On: Student Dashboard

Next spec will mirror this Canvas lens for the student: Course Card → Syllabus → Assignments To-Do → Grades, with Module → Lessons → Activities flow as the Modules page analogue. Intentionally sequenced after the teacher side so content authoring (teacher) lands before consumption (student).

## 10. Open Questions Resolved

- Approach: **A. Canvas-faithful** per stakeholder approval (2026-09-14).
- Cohort unit: **ClassGroup as Section** (approved).
- People: **Full People page** (approved).
- Grading: **Both Needs Grading queue and Attendance alerts** (approved).

---

*Next step: implementation plan via `writing-plans` skill after approval.*

