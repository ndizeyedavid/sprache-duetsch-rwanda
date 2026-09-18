import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Panel, SectionHeader } from "../../components/ui/Panel";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
} from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { getMyCourses } from "../../lib/services";
import { CourseTable } from "../../components/student/CourseTable";

type Filter = "all" | "enrolled" | "completed";

export function Courses() {
  const mine = useApi("my-courses", getMyCourses);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilter = (searchParams.get("status") as Filter) || "all";
  const urlQ = searchParams.get("q") || "";
  const [filter, setFilter] = useState<Filter>(
    ["all", "enrolled", "completed"].includes(urlFilter) ? urlFilter : "all",
  );
  const [q, setQ] = useState(urlQ);

  useEffect(() => {
    const f = (searchParams.get("status") as Filter) || "all";
    if (["all", "enrolled", "completed"].includes(f) && f !== filter)
      setFilter(f);
    const nq = searchParams.get("q") || "";
    if (nq !== q) setQ(nq);
    // filter/q are intentionally not deps — sync only on URL change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function updateFilter(next: Filter) {
    setFilter(next);
    const p = new URLSearchParams(searchParams);
    if (next === "all") p.delete("status");
    else p.set("status", next);
    setSearchParams(p, { replace: true });
  }

  function updateQ(next: string) {
    setQ(next);
    const p = new URLSearchParams(searchParams);
    if (!next.trim()) p.delete("q");
    else p.set("q", next);
    setSearchParams(p, { replace: true });
  }

  const courses = useMemo(() => mine.data ?? [], [mine.data]);
  const counts = useMemo(() => {
    const completed = courses.filter(
      (c) => c.stats.completionPercentage === 100,
    ).length;
    return {
      all: courses.length,
      enrolled: courses.length - completed,
      completed,
    };
  }, [courses]);

  return (
    <div className="space-y-4">
      <Panel>
        <SectionHeader
          title="My courses"
          // action={{ label: "Dashboard", to: "/dashboard" }}
        />
        <p className="text-xs leading-relaxed text-muted">
          Only your enrolled courses appear here. Filter by enrolled or
          completed, search, then continue where you left off.
        </p>
        {courses.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(["all", "enrolled", "completed"] as const).map((f) => {
              const c = counts[f];
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => updateFilter(f)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${active ? "border-brand bg-brand text-white" : "border-line bg-base-100 text-muted hover:border-brand/20 hover:text-ink"}`}
                >
                  {f}{" "}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${active ? "bg-white/20" : "bg-base-200"}`}
                  >
                    {c}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </Panel>

      {mine.loading ? (
        <Panel>
          <LoadingBlock label="Loading your courses…" />
        </Panel>
      ) : mine.error ? (
        <Panel>
          <ErrorBlock message={mine.error} onRetry={mine.refetch} />
        </Panel>
      ) : !mine.data || mine.data.length === 0 ? (
        <Panel>
          <EmptyBlock
            title="No enrolments yet"
            hint="An academic admin will enrol you — only then will it appear here. Dashboard cards and this table stay empty until then."
          />
        </Panel>
      ) : (
        <CourseTable
          courses={mine.data}
          filter={filter}
          onFilter={updateFilter}
          q={q}
          onQ={updateQ}
        />
      )}
    </div>
  );
}
