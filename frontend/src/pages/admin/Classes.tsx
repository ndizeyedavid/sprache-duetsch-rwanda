import { useState } from "react";
import { FiPlus,FiSearch } from "react-icons/fi";
import { AcademicSummary } from "../../components/admin/AcademicSummary";
import { ClassEditorDialog } from "../../components/admin/ClassEditorDialog";
import { ClassGroupGrid } from "../../components/admin/ClassGroupGrid";
import {
EmptyBlock,
ErrorBlock,
LoadingBlock,
} from "../../components/common/PageState";
import { Panel,SectionHeader } from "../../components/ui/Panel";
import { useApi } from "../../hooks/useApi";
import type { ClassGroupItem } from "../../lib/services";
import { listClasses,listTeachers } from "../../lib/services";

export function AdminClasses() {
  const classes = useApi("admin-classes", listClasses);
  const teachers = useApi("class-teacher-names", listTeachers);
  const [editing, setEditing] = useState<ClassGroupItem | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const rows = classes.data ?? [];
  const needle = query.trim().toLowerCase();
  const visible = rows.filter(
    (r) =>
      (!level || r.levelId === level) &&
      (!needle ||
        `${r.name} ${r.code} ${r.campus.name} ${r.intake.name}`
          .toLowerCase()
          .includes(needle)),
  );
  const names = Object.fromEntries(
    (teachers.data ?? []).map((t) => [t.id, `${t.firstName} ${t.lastName}`]),
  );
  return (
    <div className="space-y-5">
      {classes.data && (
        <AcademicSummary
          items={[
            {
              label: "Class groups",
              value: rows.length,
              note: "Across campuses and intakes",
            },
            {
              label: "Active classes",
              value: rows.filter((r) => r.isActive).length,
              note: "Available learning cohorts",
            },
            {
              label: "Enrolments",
              value: rows.reduce((n, r) => n + r._count.enrollments, 0),
              note: "Enrolment records in these classes",
            },
            {
              label: "Teacher needed",
              value: rows.filter((r) => r.isActive && !r.teacherId).length,
              note: "Active classes without an assignment",
            },
          ]}
        />
      )}
      <div>
        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionHeader title="Class groups" className="mb-0" />
            <button
              className="btn btn-primary btn-sm rounded-full"
              onClick={() => {
                setEditing(null);
                setEditorOpen(true);
                setSuccess(null);
              }}
            >
              <FiPlus aria-hidden />
              New class
            </button>
          </div>
          {success && (
            <p
              role="status"
              className="alert alert-success alert-soft mb-4 text-xs"
            >
              {success}
            </p>
          )}
          <div className="mb-4 flex flex-wrap gap-3">
            <label className="input flex min-w-0 flex-1 items-center gap-2">
              <FiSearch aria-hidden />
              <input
                aria-label="Search class groups"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search class, campus, or intake…"
                className="min-w-0 grow"
              />
            </label>
            <select
              aria-label="Filter classes by level"
              className="select w-full sm:w-auto"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="">All levels</option>
              {[
                ...new Map(
                  rows.map((r) => [r.levelId, r.level.code]),
                ).entries(),
              ].map(([id, code]) => (
                <option key={id} value={id}>
                  {code}
                </option>
              ))}
            </select>
          </div>
          {classes.loading ? (
            <LoadingBlock label="Loading classes…" />
          ) : classes.error ? (
            <ErrorBlock message={classes.error} onRetry={classes.refetch} />
          ) : !visible.length ? (
            <EmptyBlock
              title={
                rows.length ? "No matching classes" : "Create your first cohort"
              }
              hint={
                rows.length
                  ? "Try another search or level."
                  : "Choose a level, campus, and intake to get started."
              }
            />
          ) : (
            <>
              <p className="mb-3 text-xs text-muted">
                Showing {visible.length} of {rows.length} class groups
              </p>
              <ClassGroupGrid
                rows={visible}
                teacherNames={names}
                onEdit={(row) => {
                  setEditing(row);
                  setEditorOpen(true);
                  setSuccess(null);
                }}
              />
            </>
          )}
        </Panel>
      </div>
      <ClassEditorDialog
        open={editorOpen}
        row={editing}
        onClose={() => setEditorOpen(false)}
        onSaved={() => {
          classes.refetch();
          setSuccess(editing ? "Class updated." : "Class created.");
          setEditorOpen(false);
        }}
      />
    </div>
  );
}
