# Implementation Plan — Teacher Dashboard Canvas Redesign

## What we are building
A Canvas-faithful Teacher Dashboard where each ClassGroup renders as a Course Card (color strip, level badge, intake, student count, unread dot), a right rail shows To-Do (Needs Grading + Attendance to mark + Coming Up), and teachers drill ClassGroup → People (roster with search/filter/bulk message/section switcher) → Grading (Gradebook table + SpeedGrader focused view, both filtered by ClassGroup). Filters (Level/Campus/Intake) at the header slice cards and To-Do together.

## Language we agreed on
- **ClassGroup**: Admin-assigned cohort (Level + Intake + Campus + shift + teacher). Maps to Canvas Section.
- **Course Card / ClassGroup Card**: Dashboard card for one ClassGroup; entry point to its People and SpeedGrader.
- **To-Do**: Aggregated urgent items across the teacher's ClassGroups (ungraded submissions + unmarked attendance), ordered by urgency.
- **People**: Roster table for a single ClassGroup with search, status filter, and per-student shortcuts.
- **SpeedGrader**: Focus view for one submission (prompt, response, points, comment, Prev/Next within the filtered ClassGroup).
- **Gradebook**: Table view (students rows × assessments cols) for a filtered ClassGroup.

## Decisions made
- **Approach A Canvas-faithful** per stakeholder approval: balanced is not enough, full transplant with Sparch data model.
- **Cohort unit is ClassGroup** as Section — Level chips + Campus/Intake dropdowns filter cards and To-Do.
- **Full People page** per ClassGroup with section switcher, not just dashboard rows or inline expansion.
- **Both grading queues** on the dashboard: Needs Grading and Attendance alerts side by side in To-Do.
- **Nickname is localStorage** per teacher per ClassGroup (no schema change).
- **Building order**: Dashboard shell (cards + To-Do) first, then People, then Grading split — so each slice is independently shippable and demoable.

## Assumptions
- Teacher ownership is enforced in the API (`assertCanManageLevel` / `assertTeacherIfNeeded`); frontend only shows the teacher's own ClassGroups.
- Large cohorts are handled by filtering/pagination from the first call; no full 80-student loads.
- New `classGroupId` filter on `GET /assessments/attempts` is the only required schema-adjacent backend change; To-Do can be composed client-side from existing endpoints for v1.

## How to build it
1. **Backend — attempts filter**: Add optional `classGroupId` to `GET /assessments/attempts` query schema; when present, resolve to enrolled studentIds for that ClassGroup and filter attempts. Add index if missing. Verify with typecheck.
2. **Frontend — shell & state**: Add `TeacherFiltersContext` (selected Level/Campus/Intake + selected ClassGroup for drill-down). Add `ClassGroupCard` (color strip from level palette or localStorage color, nickname edit, People + SpeedGrader shortcuts, unread dot). Add `TodoRail` (To-Do + Needs Grading + Coming Up, deep-links with prefilled filters).
3. **Frontend — Dashboard rewrite**: Replace `pages/teacher/Dashboard.tsx` with 70/30 layout: header filters + cards grid + TodoRail. Cards filter live; To-Do recomputes from filtered attempts + pending attendance + upcoming sessions. Handle zero-ClassGroups empty state.
4. **Frontend — People drill-down**: New `pages/teacher/People.tsx` at `/teacher/classes/:classGroupId/people` (route added under teacher group). Roster table, search debounce, status filter, sort, bulk message (reuse `messages` contacts/createConversation), section switcher dropdown.
5. **Frontend — Grading split**: Refactor `pages/teacher/Grading.tsx` into `GradebookTable` (table view) + `SpeedGrader` (focus view) sharing the filter context. Wire filter persistence: Dashboard To-Do "Grade 4 — A2 Eve" → SpeedGrader filtered to those 4.
6. **Wiring & polish**: Persist nickname/color in localStorage; ensure all filtered endpoints use `enabled` guard pattern; update `lib/nav.ts` titles for new routes.
7. **Verify**: Frontend lint + `tsc -p tsconfig.app.json --noEmit`; backend typecheck + lint. No full build run per instruction.

## Risks
- Too much on first paint → lazy-load Gradebook, parallelize cards + To-Do fetches.
- Unassigned teacher → empty state before any filtered fetch.
