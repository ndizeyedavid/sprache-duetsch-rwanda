import { useEffect,useMemo,useState } from "react";
import {
EmptyBlock,
ErrorBlock,
LoadingBlock,
} from "../../components/common/PageState";
import {
activityDistribution,
activityPerTitle,
activityTrendByWeek,
distribution,
filterByDate,
perAssessment,
studentRows,
toScorePct,
trendByWeek,
} from "../../components/reports/utils";
import { Panel } from "../../components/ui/Panel";
import { useApi } from "../../hooks/useApi";
import { listActivitySubmissions,listAssessments,listAttempts,listClasses } from "../../lib/services";
import { rangeForPreset } from './range-for-preset';
import { createHandleExport } from './teacher-reports-handle-export';
import { TeacherReportsSection101 } from './teacher-reports-section101';
export function TeacherReports() {
  const classes = useApi("teacher-classes", listClasses);
  const assessments = useApi("teacher-assessments", listAssessments);
  const attemptsRaw = useApi("teacher-attempts-all", () =>
    listAttempts(undefined, undefined),
  );
  const [preset, setPreset] = useState<"7" | "30" | "90" | "all" | "custom">(
    "30",
  );
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { from: fromDate, to: toDate } = useMemo(
    () => rangeForPreset(preset, from, to),
    [preset, from, to],
  );

  // Keep assessment list scoped to teacher's levels (like assessments page)
  const allowedAssessments = useMemo(() => {
    const ids = new Set((classes.data ?? []).map((c) => c.levelId));
    return (assessments.data ?? []).filter((a) => ids.has(a.levelId));
  }, [classes.data, assessments.data]);

  // Re-fetch attempts when class filter changes (server-filtered for class accuracy)
  const attemptsFiltered = useApi(
    `attempts-report-${classId ?? "all"}-${assessmentId ?? "all"}`,
    () =>
      listAttempts(undefined, classId ?? undefined, assessmentId ?? undefined),
    true,
  );
  const activitySubs = useApi("activity-subs-report", () => listActivitySubmissions({}));

  const baseAttempts = useMemo(
    () => attemptsFiltered.data ?? attemptsRaw.data ?? [],
    [attemptsFiltered.data, attemptsRaw.data],
  );
  const attempts = useMemo(() => {
    let list = filterByDate(baseAttempts as never, fromDate, toDate);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((a) =>
        `${a.student.user.firstName} ${a.student.user.lastName} ${a.student.studentCode} ${a.assessment.title}`
          .toLowerCase()
          .includes(needle),
      );
    }
    return list as never[];
  }, [baseAttempts, fromDate, toDate, q]);

  const total = attempts.length;
  const graded = attempts.filter(
    (a: never) => (a as unknown as { status: string }).status === "GRADED",
  ).length;
  const pending = attempts.filter(
    (a: never) => (a as unknown as { status: string }).status === "SUBMITTED",
  ).length;
  const avg = useMemo(() => {
    const gradedScores = (
      attempts as unknown as {
        status: string;
        score: number | null;
        maxScore: unknown;
      }[]
    )
      .filter((a) => a.status === "GRADED" && toScorePct(a as never) !== null)
      .map((a) => toScorePct(a as never)!);
    return gradedScores.length
      ? Math.round(
          gradedScores.reduce((s, v) => s + v, 0) / gradedScores.length,
        )
      : null;
  }, [attempts]);
  const passRate = useMemo(() => {
    const g = attempts.filter(
      (a: never) => (a as unknown as { status: string }).status === "GRADED",
    );
    if (!g.length) return null;
    const passed = g.filter(
      (a: never) => (a as unknown as { passed: boolean | null }).passed,
    ).length;
    return Math.round((passed / g.length) * 100);
  }, [attempts]);
  const atRisk = useMemo(() => {
    const rows = studentRows(attempts as never);
    return rows.filter((r) => r.avg !== null && r.avg < 50).length;
  }, [attempts]);

  const trend = useMemo(
    () =>
      trendByWeek(attempts as never).map((d) => ({ week: d.date, avg: d.avg })),
    [attempts],
  );
  const actTrend = useMemo(() => activityTrendByWeek((activitySubs.data ?? []) as never), [activitySubs.data]);
  const actDist = useMemo(() => activityDistribution((activitySubs.data ?? []) as never), [activitySubs.data]);
  const actPer = useMemo(() => activityPerTitle((activitySubs.data ?? []) as never), [activitySubs.data]);
  const dist = useMemo(() => distribution(attempts as never), [attempts]);
  const perAss = useMemo(() => perAssessment(attempts as never), [attempts]);
  const students = useMemo(() => studentRows(attempts as never), [attempts]);
  const actTotal = (activitySubs.data ?? []).length;
  const actGraded = ((activitySubs.data ?? []) as { status: string }[]).filter((s) => s.status === "GRADED").length;
  const loading =
    attemptsFiltered.loading ||
    attemptsRaw.loading ||
    activitySubs.loading ||
    classes.loading ||
    assessments.loading;
  const error =
    attemptsFiltered.error ||
    attemptsRaw.error ||
    activitySubs.error ||
    classes.error ||
    assessments.error;

  // Client-side CSV export
  const handleExport = (...args: Parameters<ReturnType<typeof createHandleExport>>) => createHandleExport({ setExporting, setExportError, classId, attempts, preset })(...args);

  useEffect(() => {
    // Keep assessment dropdown scoped when class changes — clear if level mismatch
    if (classId && assessmentId) {
      const cls = (classes.data ?? []).find((c) => c.id === classId);
      const ass = (allowedAssessments ?? []).find((a) => a.id === assessmentId);
      if (cls && ass && cls.levelId !== ass.levelId) setAssessmentId(null);
    }
  }, [classId, assessmentId, classes.data, allowedAssessments]);

  if (classes.loading && !classes.data)
    return <LoadingBlock label="Loading reports…" />;
  if (classes.error)
    return <ErrorBlock message={classes.error} onRetry={classes.refetch} />;
  if (!classes.data || classes.data.length === 0) {
    return (
      <Panel>
        <EmptyBlock
          title="No classes assigned"
          hint="Reports appear once you are assigned to a class group."
        />
      </Panel>
    );
  }

  return (
    <TeacherReportsSection101 exporting={exporting} handleExport={handleExport} preset={preset} setPreset={setPreset} from={from} to={to} setFrom={setFrom} setTo={setTo} classId={classId} setClassId={setClassId} classes={classes} assessmentId={assessmentId} setAssessmentId={setAssessmentId} allowedAssessments={allowedAssessments} q={q} setQ={setQ} attemptsFiltered={attemptsFiltered} exportError={exportError} loading={loading} error={error} attemptsRaw={attemptsRaw} total={total} graded={graded} avg={avg} passRate={passRate} atRisk={atRisk} pending={pending} actTotal={actTotal} actGraded={actGraded} trend={trend} actTrend={actTrend} actDist={actDist} dist={dist} perAss={perAss} actPer={actPer} students={students} />
  );
}
