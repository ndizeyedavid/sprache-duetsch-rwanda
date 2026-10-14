import { FiBarChart2,FiDownload } from "react-icons/fi";
import { ReportsToolbar } from "../../components/reports/ReportsToolbar";
import { Panel } from "../../components/ui/Panel";
export function TeacherReportsSection1(props: { exporting: boolean; handleExport: () => Promise<void>; preset: "all" | "7" | "30" | "90" | "custom"; setPreset: import("react").Dispatch<import("react").SetStateAction<"all" | "7" | "30" | "90" | "custom">>; from: string; to: string; setFrom: import("react").Dispatch<import("react").SetStateAction<string>>; setTo: import("react").Dispatch<import("react").SetStateAction<string>>; classId: string | null; setClassId: import("react").Dispatch<import("react").SetStateAction<string | null>>; classes: import("../../hooks/useApi").ApiState<import("../../lib/services").ClassGroupItem[]>; assessmentId: string | null; setAssessmentId: import("react").Dispatch<import("react").SetStateAction<string | null>>; allowedAssessments: import("../../lib/services").AuthoredAssessment[]; q: string; setQ: import("react").Dispatch<import("react").SetStateAction<string>>; attemptsFiltered: import("../../hooks/useApi").ApiState<{ id: string; status: string; attemptNumber: number; score: number | null; maxScore: import("../../lib/services").Money; passed: boolean | null; submittedAt: string | null; student: { studentCode: string; user: { firstName: string; lastName: string; }; }; assessment: { id: string; title: string; }; }[]>; exportError: string | null }) {
const { exporting, handleExport, preset, setPreset, from, to, setFrom, setTo, classId, setClassId, classes, assessmentId, setAssessmentId, allowedAssessments, q, setQ, attemptsFiltered, exportError } = props;
return (<Panel>
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
            className="mt-2 rounded-box bg-coral text-error-content px-3 py-2 text-xs font-medium text-[#D8482F]"
          >
            {attemptsFiltered.error ?? exportError}
          </p>
        ) : null}
      </Panel>);
}
