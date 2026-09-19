import { useEffect, useMemo, useState } from "react";
import { FiAward, FiBarChart2, FiDownload, FiTrendingUp } from "react-icons/fi";
import { Panel, SectionHeader } from "../../components/ui/Panel";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
} from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { downloadFile } from "../../lib/api";
import { apiErrorMessage } from "../../lib/api";
import { listActivitySubmissions, listAssessments, listAttempts, listClasses } from "../../lib/services";
import { COLORS } from "../../lib/theme";
import { AreaTrend } from "../../components/charts/AreaTrend";
import { DonutChart } from "../../components/charts/DonutChart";
import { GroupedBar } from "../../components/charts/GroupedBar";
import { ReportsToolbar } from "../../components/reports/ReportsToolbar";
import { KpiStrip } from "../../components/reports/KpiStrip";
import { StudentTable } from "../../components/reports/StudentTable";
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

function rangeForPreset(
  preset: string,
  from: string,
  to: string,
): { from: Date | null; to: Date | null } {
  const now = new Date();
  if (preset === "7")
    return { from: new Date(now.getTime() - 7 * 864e5), to: now };
  if (preset === "30")
    return { from: new Date(now.getTime() - 30 * 864e5), to: now };
  if (preset === "90")
    return { from: new Date(now.getTime() - 90 * 864e5), to: now };
  if (preset === "custom")
    return {
      from: from ? new Date(from) : null,
      to: to ? new Date(`${to}T23:59:59`) : null,
    };
  return { from: null, to: null };
}

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
  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      // Prefer server CSV when a class is selected (scoped), else build client CSV
      if (classId) {
        await downloadFile(
          `/assessments/attempts/export?classGroupId=${classId}`,
          `reports-${classId}.csv`,
        );
      } else {
        const headers = [
          "studentCode",
          "studentName",
          "assessment",
          "status",
          "score",
          "maxScore",
          "pass",
          "submittedAt",
        ];
        const lines = [headers.join(",")];
        for (const a of attempts as unknown as {
          student: {
            studentCode: string;
            user: { firstName: string; lastName: string };
          };
          assessment: { title: string };
          status: string;
          score: number | null;
          maxScore: unknown;
          passed: boolean | null;
          submittedAt: string | null;
        }[]) {
          const row = [
            a.student.studentCode,
            `"${a.student.user.firstName} ${a.student.user.lastName}"`,
            `"${a.assessment.title.replace(/"/g, '""')}"`,
            a.status,
            a.score ?? "",
            String(a.maxScore ?? ""),
            a.passed === null ? "" : String(a.passed),
            a.submittedAt ?? "",
          ];
          lines.push(row.join(","));
        }
        const blob = new Blob([lines.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `reports-${preset}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setExportError(apiErrorMessage(err, "Could not export."));
    } finally {
      setExporting(false);
    }
  }

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
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-base font-bold">
              <FiBarChart2 aria-hidden className="text-brand" />
              Reports
            </h1>
            <p className="mt-1 text-xs leading-snug text-muted">
              Performance analytics — filter by date, class and assessment to
              see trends, distribution and every student.
            </p>
          </div>
          <button
            type="button"
            disabled={exporting}
            onClick={() => void handleExport()}
            className="btn btn-sm gap-1 rounded-full border-line bg-base-100 disabled:opacity-60"
          >
            {exporting ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <FiDownload aria-hidden />
            )}
            Export
          </button>
        </div>
        <div className="mt-4">
          <ReportsToolbar
            preset={preset as never}
            onPreset={setPreset as never}
            from={from}
            to={to}
            onFrom={setFrom}
            onTo={setTo}
            classId={classId}
            onClass={setClassId}
            classes={classes.data as never}
            assessmentId={assessmentId}
            onAssessment={setAssessmentId}
            assessments={allowedAssessments as never}
            q={q}
            onQ={setQ}
            onClear={() => {
              setPreset("all");
              setFrom("");
              setTo("");
              setClassId(null);
              setAssessmentId(null);
              setQ("");
            }}
          />
        </div>
        {attemptsFiltered.error || exportError ? (
          <p
            role="alert"
            className="mt-2 rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"
          >
            {attemptsFiltered.error ?? exportError}
          </p>
        ) : null}
      </Panel>

      {loading ? (
        <Panel>
          <LoadingBlock label="Crunching data…" />
        </Panel>
      ) : error ? (
        <Panel>
          <ErrorBlock
            message={error}
            onRetry={() => {
              attemptsFiltered.refetch();
              attemptsRaw.refetch();
            }}
          />
        </Panel>
      ) : (
        <>
          <KpiStrip
            total={total}
            graded={graded}
            avg={avg}
            passRate={passRate}
            atRisk={atRisk}
            pending={pending}
            actTotal={actTotal}
            actGraded={actGraded}
          />

          <div className="grid gap-4 lg:grid-cols-12">
            <Panel className="lg:col-span-8">
              <SectionHeader title="Performance trend — exams" />
              {trend.length === 0 ? (
                <EmptyBlock
                  title="Not enough graded data"
                  hint="Trend appears once you have graded submissions in this period."
                />
              ) : (
                <AreaTrend
                  data={trend as never}
                  xKey="week"
                  series={[{ key: "avg", label: "Avg %", color: COLORS.brand }]}
                  suffix="%"
                />
              )}
              <p className="mt-2 text-[11px] text-muted">Weekly average of graded exam scores.</p>
            </Panel>
            <Panel className="lg:col-span-4">
              <SectionHeader title="Exam status" />
              {(() => {
                const sub = pending;
                const grd = graded;
                const prog = total - sub - grd;
                const data = [
                  { name: "Graded", value: grd, color: COLORS.brand },
                  { name: "Pending", value: sub, color: COLORS.coral },
                  { name: "In progress", value: prog, color: COLORS.muted },
                ].filter((d) => d.value > 0);
                if (!data.length)
                  return <EmptyBlock title="No submissions in range" />;
                return (
                  <DonutChart data={data} suffix="">
                    <span className="text-lg font-bold">{total}</span>
                    <span className="text-[11px] text-muted">total</span>
                  </DonutChart>
                );
              })()}
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-brand-soft px-2 py-1 text-[#B30A00]">
                  Graded {graded}
                </span>
                <span className="rounded-full bg-coral-soft px-2 py-1 text-[#D8482F]">
                  Pending {pending}
                </span>
              </div>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Panel className="lg:col-span-8">
              <SectionHeader title="Activity trend" />
              {actTrend.length === 0 ? (
                <EmptyBlock title="No graded activity data" hint="Trend appears once activities are graded." />
              ) : (
                <AreaTrend
                  data={actTrend as never}
                  xKey="date"
                  series={[{ key: "avg", label: "Avg %", color: COLORS.navy }]}
                  suffix="%"
                />
              )}
              <p className="mt-2 text-[11px] text-muted">Weekly average score for lesson activities (0-1 scaled to %).</p>
            </Panel>
            <Panel className="lg:col-span-4">
              <SectionHeader title="Activity scores" />
              {actDist.every((d) => d.count === 0) ? (
                <EmptyBlock title="No graded activities yet" />
              ) : (
                <GroupedBar
                  data={actDist.map((d) => ({ bucket: d.bucket, count: d.count }))}
                  xKey="bucket"
                  series={[{ key: "count", label: "Students", color: COLORS.navy }]}
                  height={240}
                />
              )}
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Panel className="lg:col-span-6">
              <SectionHeader title="Grade distribution — exams" />
              {dist.every((d) => d.count === 0) ? (
                <EmptyBlock title="No graded scores yet" />
              ) : (
                <GroupedBar
                  data={dist.map((d) => ({ bucket: d.bucket, count: d.count }))}
                  xKey="bucket"
                  series={[
                    { key: "count", label: "Students", color: COLORS.navy },
                  ]}
                  height={240}
                />
              )}
            </Panel>
            <Panel className="lg:col-span-6">
              <SectionHeader title="By assessment" />
              {perAss.length === 0 ? (
                <EmptyBlock
                  title="No assessment data"
                  hint="Pick All assessments or a wider date."
                />
              ) : (
                <GroupedBar
                  data={perAss.map((a) => ({ name: a.name, avg: a.avg }))}
                  xKey="name"
                  series={[{ key: "avg", label: "Avg %", color: COLORS.sun }]}
                  height={240}
                  suffix="%"
                />
              )}
              {perAss.length ? (
                <p className="mt-2 text-[11px] text-muted">
                  <FiTrendingUp aria-hidden className="inline" /> Pass rate
                  shown on hover —{" "}
                  <span className="font-mono">
                    {perAss.map((a) => `${a.name}: ${a.pass}%`).join(" · ")}
                  </span>
                </p>
              ) : null}
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Panel className="lg:col-span-6">
              <SectionHeader title="Activity scores" />
              {actDist.every((d) => d.count === 0) ? (
                <EmptyBlock title="No activity scores yet" />
              ) : (
                <GroupedBar
                  data={actDist.map((d) => ({ bucket: `Score ${d.bucket}`, count: d.count }))}
                  xKey="bucket"
                  series={[{ key: "count", label: "Students", color: COLORS.navy }]}
                  height={240}
                />
              )}
            </Panel>
            <Panel className="lg:col-span-6">
              <SectionHeader title="By activity" />
              {actPer.length === 0 ? (
                <EmptyBlock title="No activity data" hint="Grade activities to see averages." />
              ) : (
                <GroupedBar
                  data={actPer.map((a) => ({ name: a.name, avg: a.avg }))}
                  xKey="name"
                  series={[{ key: "avg", label: "Avg %", color: COLORS.brand }]}
                  height={240}
                  suffix="%"
                />
              )}
            </Panel>
          </div>

          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionHeader
                title={`Students · ${students.length}`}
                className="mb-0"
              />
              <span className="flex items-center gap-1 text-xs text-muted">
                <FiAward aria-hidden className="text-brand" />
                Click a header to sort
              </span>
            </div>
            <div className="mt-4">
              <StudentTable rows={students} />
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
