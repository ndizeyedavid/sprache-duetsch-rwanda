import { FiFilter,FiX } from "react-icons/fi";
import { useStaffPortal } from "../../components/teacher/useStaffPortal";
import { Panel } from "../../components/ui/Panel";
import {
humanize
} from "../../lib/services";
export function TeacherGradingSection1(props: { classGroupId: string | null; setClassGroupId: import("react").Dispatch<import("react").SetStateAction<string | null>>; setSelectedId: import("react").Dispatch<import("react").SetStateAction<string | null>>; classes: import("../../hooks/useApi").ApiState<import("../../lib/services").ClassGroupItem[]>; assessmentId: string | null; setAssessmentId: import("react").Dispatch<import("react").SetStateAction<string | null>>; assessmentOptions: import("../../hooks/useApi").ApiState<import("../../lib/services").AuthoredAssessment[]>; setView: import("react").Dispatch<import("react").SetStateAction<"queue" | "gradebook" | "activities">>; view: "queue" | "gradebook" | "activities"; selectedAssessment: import("../../lib/services").AuthoredAssessment | null | undefined }) {
const { classGroupId, setClassGroupId, setSelectedId, classes, assessmentId, setAssessmentId, assessmentOptions, setView, view, selectedAssessment } = props;
const { admin } = useStaffPortal();
return (<Panel>
 <div className="flex flex-wrap items-center gap-2">
 <select
 value={classGroupId ?? ""}
 onChange={(e) => {
 setClassGroupId(e.currentTarget.value || null);
 setSelectedId(null);
 }}
 className="select select-sm rounded-full border-line bg-base-200"
 aria-label="Filter by class"
 >
 <option value="">{admin ? "All classes" : "All my classes"}</option>
 {(classes.data ?? []).map((g) => (
 <option key={g.id} value={g.id}>
 {g.name} · {g.level.code}
 </option>
 ))}
 </select>
 <select
 value={assessmentId ?? ""}
 onChange={(e) => {
 setAssessmentId(e.currentTarget.value || null);
 setSelectedId(null);
 }}
 className="select select-sm rounded-full border-line bg-base-200"
 aria-label="Filter by assessment"
 >
 <option value="">All assessments</option>
 {(assessmentOptions.data ?? []).map((a) => (
 <option key={a.id} value={a.id}>
 {a.title} · {humanize(a.type)}
 </option>
 ))}
 </select>
  <div className="tabs tabs-boxed bg-base-200 p-1">
  <button
  type="button"
  onClick={() => setView("queue")}
  className={`tab tab-sm ${view === "queue" ? "tab-active bg-brand text-white" : ""}`}
  >
  Queue
  </button>
  <button
  type="button"
  onClick={() => setView("gradebook")}
  className={`tab tab-sm ${view === "gradebook" ? "tab-active bg-brand text-white" : ""}`}
  >
  Gradebook
  </button>
  <button
  type="button"
  onClick={() => setView("activities")}
  className={`tab tab-sm ${view === "activities" ? "tab-active bg-brand text-white" : ""}`}
  >
  Activities
  </button>
  </div>
 </div>
 {assessmentId ? (
 <div className="mt-3 flex flex-wrap items-center gap-2 rounded-full border border-brand bg-base-100 px-4 py-2 text-xs">
 <FiFilter aria-hidden className="text-brand" />
 <span className="font-medium text-brand">Filtered:</span>
 <span className="font-semibold">
 {selectedAssessment ? selectedAssessment.title : assessmentId}
 </span>
 <button
 type="button"
 onClick={() => {
 setAssessmentId(null);
 setSelectedId(null);
 }}
 className="btn btn-xs gap-1 rounded-full bg-white"
 >
 <FiX aria-hidden />
 Clear
 </button>
 </div>
 ) : null}
 </Panel>);
}
