import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import { Panel } from "../../components/ui/Panel";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { getMyAssessments, getMyAttempts, getMySkills, listLevels } from "../../lib/services";
import { TABS } from "../../components/grades/constants";
import type { GradesTab } from "../../components/grades/constants";
import { GradesSummary } from "../../components/grades/GradesSummary";
import { GradesToolbar } from "../../components/grades/GradesToolbar";
import { GradesTable } from "../../components/grades/GradesTable";
import { ProgressionPanel } from "../../components/grades/ProgressionPanel";
import { toCsv } from "../../components/grades/utils";

export function Grades() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") as GradesTab) || "Grades";
  const assessmentsApi = useApi("my-assessments", getMyAssessments);
  const attemptsApi = useApi("my-attempts", getMyAttempts);
  const skillsApi = useApi("my-skills", getMySkills);
  const levelsApi = useApi("levels", listLevels);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [course, setCourse] = useState(searchParams.get("course") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [whatIfOn, setWhatIfOn] = useState(false);
  const [whatIf, setWhatIf] = useState<Record<string, number>>({});

  function setTab(t: GradesTab) {
    const next = new URLSearchParams(searchParams);
    if (t === "Grades") next.delete("tab");
    else next.set("tab", t);
    setSearchParams(next);
  }

  const assessments = useMemo(() => assessmentsApi.data ?? [], [assessmentsApi.data]);
  const attempts = useMemo(() => attemptsApi.data ?? [], [attemptsApi.data]);

  const courses = useMemo(() => {
    const fromLevels = (levelsApi.data ?? []).map((l) => ({ code: l.code, title: l.title }));
    if (fromLevels.length) return fromLevels;
    const map = new Map<string, string>();
    for (const a of assessments) if (a.level) map.set(a.level.code, a.level.title);
    return [...map.entries()].map(([code, title]) => ({ code, title }));
  }, [levelsApi.data, assessments]);

  const filtered = useMemo(() => {
    let list = assessments;
    if (course) list = list.filter((a) => (a.level?.code ?? a.levelId) === course);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || (a.level?.code ?? "").toLowerCase().includes(q));
    }
    if (status === "graded") list = list.filter((a) => a.bestScore !== null);
    if (status === "pending") list = list.filter((a) => a.attemptCount > 0 && a.bestScore === null);
    if (status === "missing") list = list.filter((a) => a.attemptCount === 0);
    return list;
  }, [assessments, course, search, status]);

  const loading = assessmentsApi.loading || attemptsApi.loading;
  const error = assessmentsApi.error || attemptsApi.error;

  function handleExport() {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grades.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">Grades</h1>
            <p className="text-xs text-muted">All courses · scores, averages, and what-if projections</p>
          </div>
          <div className="tabs tabs-boxed bg-base-200 p-1">
            {TABS.map((t) => (
              <button key={t} type="button" onClick={() => setTab(t as GradesTab)} className={`tab tab-sm ${tab === t ? "tab-active bg-brand text-white" : ""}`}>{t}</button>
            ))}
          </div>
        </div>
        {tab === "Grades" ? <div className="mt-4"><GradesToolbar search={search} onSearch={setSearch} course={course} onCourse={setCourse} courses={courses} status={status} onStatus={setStatus} whatIf={whatIfOn} onWhatIf={setWhatIfOn} onExport={handleExport} /></div> : null}
        {whatIfOn ? <p className="mt-3 flex items-center gap-2 rounded-box bg-warning/10 px-3 py-2 text-xs"><FiAlertCircle aria-hidden />What-if is on — scores you enter are hypothetical and not saved. <button type="button" onClick={() => setWhatIf({})} className="link text-warning">Reset</button></p> : null}
      </Panel>

      {loading ? <LoadingBlock label="Loading grades…" /> : error ? <ErrorBlock message={error} onRetry={() => { assessmentsApi.refetch(); attemptsApi.refetch(); }} /> : assessments.length === 0 ? <Panel><EmptyBlock title="No grades yet" hint="Grades appear once assignments are published for your course." /></Panel> : tab === "Progression" ? <ProgressionPanel assessments={assessments} attempts={attempts as never} skills={skillsApi.data ?? null} /> : (
        <>
          <GradesSummary assessments={filtered} whatIf={whatIf} whatIfOn={whatIfOn} />
          <GradesTable assessments={filtered} whatIf={whatIf} whatIfOn={whatIfOn} onWhatIfChange={(id, v) => setWhatIf((p) => { const n = { ...p }; if (v === null) delete n[id]; else n[id] = v; return n; })} />
        </>
      )}
    </div>
  );
}
