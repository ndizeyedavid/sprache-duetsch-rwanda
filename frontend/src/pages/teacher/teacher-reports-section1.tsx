import { ReportsToolbar } from "../../components/reports/ReportsToolbar";
import { Panel } from "../../components/ui/Panel";
export function TeacherReportsSection1(props: { preset: "all" | "7" | "30" | "90" | "custom"; setPreset: import("react").Dispatch<import("react").SetStateAction<"all" | "7" | "30" | "90" | "custom">>; from: string; to: string; setFrom: import("react").Dispatch<import("react").SetStateAction<string>>; setTo: import("react").Dispatch<import("react").SetStateAction<string>>; classId: string | null; setClassId: import("react").Dispatch<import("react").SetStateAction<string | null>>; classes: import("../../hooks/useApi").ApiState<import("../../lib/services").ClassGroupItem[]>; assessmentId: string | null; setAssessmentId: import("react").Dispatch<import("react").SetStateAction<string | null>>; allowedAssessments: import("../../lib/services").AuthoredAssessment[]; q: string; setQ: import("react").Dispatch<import("react").SetStateAction<string>>; attemptsFiltered: import("../../hooks/useApi").ApiState<{ id: string; status: string; attemptNumber: number; score: number | null; maxScore: import("../../lib/services").Money; passed: boolean | null; submittedAt: string | null; student: { studentCode: string; user: { firstName: string; lastName: string; }; }; assessment: { id: string; title: string; }; }[]>; exportError: string | null }) {
const { preset, setPreset, from, to, setFrom, setTo, classId, setClassId, classes, assessmentId, setAssessmentId, allowedAssessments, q, setQ, attemptsFiltered, exportError } = props;
return (<Panel>
        <div>
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
