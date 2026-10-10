import { FiAward } from "react-icons/fi";
import {
ErrorBlock,
LoadingBlock
} from "../../components/common/PageState";
import { KpiStrip } from "../../components/reports/KpiStrip";
import { StudentTable } from "../../components/reports/StudentTable";
import { Panel,SectionHeader } from "../../components/ui/Panel";
import { TeacherReportsSection1 } from './teacher-reports-section1';
import { TeacherReportsSection2 } from './teacher-reports-section2';
import { TeacherReportsSection3 } from './teacher-reports-section3';
import { TeacherReportsSection4 } from './teacher-reports-section4';
import { TeacherReportsSection5 } from './teacher-reports-section5';
export function TeacherReportsSection101(props: { exporting: boolean; handleExport: () => Promise<void>; preset: "all" | "7" | "30" | "90" | "custom"; setPreset: import("react").Dispatch<import("react").SetStateAction<"all" | "7" | "30" | "90" | "custom">>; from: string; to: string; setFrom: import("react").Dispatch<import("react").SetStateAction<string>>; setTo: import("react").Dispatch<import("react").SetStateAction<string>>; classId: string | null; setClassId: import("react").Dispatch<import("react").SetStateAction<string | null>>; classes: import("../../hooks/useApi").ApiState<import("../../lib/services").ClassGroupItem[]>; assessmentId: string | null; setAssessmentId: import("react").Dispatch<import("react").SetStateAction<string | null>>; allowedAssessments: import("../../lib/services").AuthoredAssessment[]; q: string; setQ: import("react").Dispatch<import("react").SetStateAction<string>>; attemptsFiltered: import("../../hooks/useApi").ApiState<{ id: string; status: string; attemptNumber: number; score: number | null; maxScore: import("../../lib/services").Money; passed: boolean | null; submittedAt: string | null; student: { studentCode: string; user: { firstName: string; lastName: string; }; }; assessment: { id: string; title: string; }; }[]>; exportError: string | null; loading: boolean; error: string | null; attemptsRaw: import("../../hooks/useApi").ApiState<{ id: string; status: string; attemptNumber: number; score: number | null; maxScore: import("../../lib/services").Money; passed: boolean | null; submittedAt: string | null; student: { studentCode: string; user: { firstName: string; lastName: string; }; }; assessment: { id: string; title: string; }; }[]>; total: number; graded: number; avg: number | null; passRate: number | null; atRisk: number; pending: number; actTotal: number; actGraded: number; trend: { week: string; avg: number; }[]; actTrend: { date: string; avg: number; count: number; }[]; actDist: { bucket: string; count: number; color: string; }[]; dist: { bucket: string; count: number; color: string; }[]; perAss: { name: string; avg: number; pass: number; }[]; actPer: { name: string; avg: number; count: number; }[]; students: { code: string; name: string; count: number; avg: number | null; passRate: number | null; lastAt: string | null; }[] }) {
const { exporting, handleExport, preset, setPreset, from, to, setFrom, setTo, classId, setClassId, classes, assessmentId, setAssessmentId, allowedAssessments, q, setQ, attemptsFiltered, exportError, loading, error, attemptsRaw, total, graded, avg, passRate, atRisk, pending, actTotal, actGraded, trend, actTrend, actDist, dist, perAss, actPer, students } = props;
return (<div className="space-y-4">
      <TeacherReportsSection1 exporting={exporting} handleExport={handleExport} preset={preset} setPreset={setPreset} from={from} to={to} setFrom={setFrom} setTo={setTo} classId={classId} setClassId={setClassId} classes={classes} assessmentId={assessmentId} setAssessmentId={setAssessmentId} allowedAssessments={allowedAssessments} q={q} setQ={setQ} attemptsFiltered={attemptsFiltered} exportError={exportError} />

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

          <TeacherReportsSection2 trend={trend} pending={pending} graded={graded} total={total} />

          <TeacherReportsSection4 actTrend={actTrend} actDist={actDist} />

          <TeacherReportsSection3 dist={dist} perAss={perAss} />

          <TeacherReportsSection5 actDist={actDist} actPer={actPer} />

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
    </div>);
}
