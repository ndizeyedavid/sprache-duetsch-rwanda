import { JoinIntake } from '../../components/student/JoinIntake';
import { useEffect,useMemo,useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
EmptyBlock,
ErrorBlock,
LoadingBlock,
} from "../../components/common/PageState";
import { CourseTable } from "../../components/student/CourseTable";
import { Panel } from "../../components/ui/Panel";
import { useApi } from "../../hooks/useApi";
import { getMyCourses } from "../../lib/services";

type Filter = "all" | "enrolled" | "completed";
const FILTER_LABELS: Record<Filter, string> = { all: "All", enrolled: "In progress", completed: "Completed" };

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
    <div className="journey-enter space-y-6">
      <Panel>
        <h1 className="text-xl font-semibold">My courses</h1>
        <p className="mt-1 text-sm text-muted">
          Continue a course, or open a finished one to revise.
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
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? "border-brand bg-brand/10 text-brand" : "border-line bg-base-100 text-muted hover:border-brand/30 hover:text-ink"}`}
                >
                  {FILTER_LABELS[f]}{" "}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${active ? "bg-brand/15" : "bg-base-200"}`}
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
            title="No courses yet"
            hint="Join a course below. It appears here and opens once its fee is paid."
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

      <JoinIntake onJoined={mine.refetch} />
    </div>
  );
}
