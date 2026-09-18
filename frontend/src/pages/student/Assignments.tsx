import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Panel } from "../../components/ui/Panel";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
} from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { getMyAssignments } from "../../lib/services";
import { AssignmentsToolbar } from "../../components/assignments/AssignmentsToolbar";
import { AssignmentCard } from "../../components/assignments/AssignmentCard";
import {
  groupByBucket,
  groupByCourse,
} from "../../components/assignments/utils";
import type { AssignmentsTab } from "../../components/assignments/constants";

export function Assignments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const assignments = useApi("my-assignments", getMyAssignments);

  const tab = (searchParams.get("tab") as AssignmentsTab) || "All";
  const q = searchParams.get("q") || "";
  const course = searchParams.get("course") || "";
  const status = searchParams.get("status") || "";
  const [localQ, setLocalQ] = useState(q);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  }

  const list = useMemo(() => assignments.data ?? [], [assignments.data]);

  const courses = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of list) map.set(a.levelCode, a.levelTitle);
    return [...map.entries()].map(([code, title]) => ({ code, title }));
  }, [list]);

  const filtered = useMemo(() => {
    let out = list;
    if (tab !== "All") {
      const now = new Date();
      out = out.filter((a) => {
        if (tab === "Missing") return a.status === "MISSING";
        if (tab === "Overdue")
          return a.dueAt
            ? new Date(a.dueAt) < now &&
                a.status !== "GRADED" &&
                a.status !== "SUBMITTED"
            : false;
        if (tab === "Upcoming")
          return a.dueAt
            ? new Date(a.dueAt) >= now &&
                a.status !== "GRADED" &&
                a.status !== "SUBMITTED"
            : false;
        if (tab === "Done")
          return a.status === "GRADED" || a.status === "SUBMITTED";
        return true;
      });
    }
    if (course) out = out.filter((a) => a.levelCode === course);
    if (status) out = out.filter((a) => a.status === status);
    if (q) {
      const needle = q.toLowerCase();
      out = out.filter((a) =>
        `${a.title} ${a.levelCode} ${a.type}`.toLowerCase().includes(needle),
      );
    }
    return out;
  }, [list, tab, course, status, q]);

  const grouped = useMemo(
    () =>
      course
        ? groupByCourse(filtered).map((g) => ({
            label: `${g.code} · ${g.title}`,
            items: g.items,
          }))
        : groupByBucket(filtered),
    [filtered, course],
  );
  const counts = useMemo(() => {
    const now = new Date();
    const c: Record<string, number> = {
      All: list.length,
      Missing: 0,
      Overdue: 0,
      Upcoming: 0,
      Done: 0,
    };
    for (const a of list) {
      if (a.status === "MISSING") c.Missing += 1;
      if (
        a.dueAt &&
        new Date(a.dueAt) < now &&
        a.status !== "GRADED" &&
        a.status !== "SUBMITTED"
      )
        c.Overdue += 1;
      if (
        a.dueAt &&
        new Date(a.dueAt) >= now &&
        a.status !== "GRADED" &&
        a.status !== "SUBMITTED"
      )
        c.Upcoming += 1;
      if (a.status === "GRADED" || a.status === "SUBMITTED") c.Done += 1;
    }
    return c;
  }, [list]);

  return (
    <div className="space-y-4">
      <Panel>
        <h1 className="text-xl font-bold">Assignments</h1>
        <p className="text-sm text-muted">
          All activities and assessments due for your levels.
        </p>
        <div className="mt-4">
          <AssignmentsToolbar
            tab={tab}
            onTab={(t) => setParam("tab", t === "All" ? null : t)}
            counts={counts}
            search={localQ}
            onSearch={setLocalQ}
            course={course}
            onCourse={(v) => setParam("course", v || null)}
            courses={courses}
            status={status}
            onStatus={(v) => setParam("status", v || null)}
          />
          {localQ !== q ? (
            <button
              type="button"
              onClick={() => setParam("q", localQ || null)}
              className="btn btn-xs mt-2 rounded-full border-line bg-base-100"
            >
              Apply search
            </button>
          ) : null}
        </div>
      </Panel>

      {assignments.loading ? (
        <LoadingBlock label="Loading assignments…" />
      ) : assignments.error ? (
        <ErrorBlock message={assignments.error} onRetry={assignments.refetch} />
      ) : filtered.length === 0 ? (
        <Panel>
          <EmptyBlock
            title="No assignments"
            hint="Nothing matches your filters — try another course or clear the search."
          />
        </Panel>
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <div key={g.label}>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-muted">
                {g.label} · {g.items.length}
              </h2>
              <div className="space-y-2">
                {g.items.map((a) => (
                  <AssignmentCard key={a.id} item={a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
