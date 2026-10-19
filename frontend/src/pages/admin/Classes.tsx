import { useState } from "react";
import { FiPlus,FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ClassEditorDialog } from "../../components/admin/ClassEditorDialog";
import { ClassGroupGrid } from "../../components/admin/ClassGroupGrid";
import { WORKSPACE_CONTEXT } from "../../components/admin/workspace-context";
import {
EmptyBlock,
ErrorBlock,
LoadingBlock,
} from "../../components/common/PageState";
import { heroAction,heroGhost } from "../../components/hero/hero-actions";
import { PageHero } from "../../components/hero/PageHero";
import { Panel } from "../../components/ui/Panel";
import { useApi } from "../../hooks/useApi";
import type { ClassGroupItem } from "../../lib/services";
import { listClasses,listTeachers } from "../../lib/services";

const context = WORKSPACE_CONTEXT.classes;

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
  const active = rows.filter((r) => r.isActive).length;
  const enrolled = rows.reduce((n, r) => n + r._count.enrollments, 0);
  const needTeacher = rows.filter((r) => r.isActive && !r.teacherId).length;
  const openEditor = (row: ClassGroupItem | null) => {
    setEditing(row);
    setEditorOpen(true);
    setSuccess(null);
  };
  return (
    <div className="space-y-5">
      <PageHero
        eyebrow={context.category}
        icon={context.icon}
        title="Classes"
        description="Every class group across campuses and intakes: its level, its teacher and how many learners it holds."
        art="campus"
        scoped
        meta={
          classes.data ? (
            <>
              <span className="hero-chip">{rows.length} class group{rows.length === 1 ? "" : "s"}</span>
              <span className="hero-chip">{active} active</span>
              <span className="hero-chip">{enrolled} enrolment{enrolled === 1 ? "" : "s"}</span>
              {needTeacher ? (
                <span className="hero-chip hero-chip-solid">{needTeacher} without a teacher</span>
              ) : null}
            </>
          ) : null
        }
        actions={
          <>
            <button type="button" className={heroAction} onClick={() => openEditor(null)}>
              <FiPlus aria-hidden />
              New class
            </button>
            {context.links.map((link) => (
              <Link key={link.to} to={link.to} className={heroGhost}>{link.label}</Link>
            ))}
          </>
        }
      />
      <Panel>
        {success && (
          <p role="status" className="alert alert-success alert-soft mb-4 text-xs">
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
            {[...new Map(rows.map((r) => [r.levelId, r.level.code])).entries()].map(([id, code]) => (
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
            title={rows.length ? "No matching classes" : "Create your first cohort"}
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
            <ClassGroupGrid rows={visible} teacherNames={names} onEdit={openEditor} />
          </>
        )}
      </Panel>
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
