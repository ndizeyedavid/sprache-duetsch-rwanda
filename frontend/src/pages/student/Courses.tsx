import { CoursesHero,type CourseFilter } from '../../components/student/CoursesHero';
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

type Filter = CourseFilter;

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
      <CoursesHero courses={courses} filter={filter} counts={counts} onFilter={updateFilter} />

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

      <div id="join-course" className="scroll-mt-24">
        <JoinIntake onJoined={mine.refetch} />
      </div>
    </div>
  );
}
