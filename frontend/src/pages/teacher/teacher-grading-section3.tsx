import {
EmptyBlock,
ErrorBlock,
LoadingBlock,
} from "../../components/common/PageState";
import { GradebookPanel } from "../../components/grading/GradebookPanel";
import { Panel,SectionHeader } from "../../components/ui/Panel";
export function TeacherGradingSection3(props: { classGroupId: string | null; classDetail: import("../../hooks/useApi").ApiState<import("../../lib/services").ClassGroupDetail>; allAssessments: import("../../hooks/useApi").ApiState<import("../../lib/services").AuthoredAssessment[]>; gradebookAttempts: import("../../hooks/useApi").ApiState<{ id: string; status: string; attemptNumber: number; score: number | null; maxScore: import("../../lib/services").Money; passed: boolean | null; submittedAt: string | null; student: { studentCode: string; user: { firstName: string; lastName: string; }; }; assessment: { id: string; title: string; }; }[]>; setView: import("react").Dispatch<import("react").SetStateAction<"queue" | "gradebook" | "activities">>; setFilter: import("react").Dispatch<import("react").SetStateAction<"SUBMITTED" | "GRADED" | "IN_PROGRESS">>; setQueueSearch: import("react").Dispatch<import("react").SetStateAction<string>>; setSelectedId: import("react").Dispatch<import("react").SetStateAction<string | null>> }) {
const { classGroupId, classDetail, allAssessments, gradebookAttempts, setView, setFilter, setQueueSearch, setSelectedId } = props;
return (<Panel>
  <SectionHeader title="Gradebook" />
 {!classGroupId ? (
 <EmptyBlock
 title="Select a class"
 hint="Choose a class to see the gradebook table."
 />
 ) : classDetail.loading ||
 allAssessments.loading ||
 gradebookAttempts.loading ? (
 <LoadingBlock label="Loading gradebook…" />
 ) : classDetail.error ||
 allAssessments.error ||
 gradebookAttempts.error ? (
 <ErrorBlock
 message={
 classDetail.error ??
 allAssessments.error ??
 gradebookAttempts.error ??
 "Could not load."
 }
 onRetry={() => {
 classDetail.refetch();
 allAssessments.refetch();
 gradebookAttempts.refetch();
 }}
 />
 ) : (
 <GradebookPanel
 loading={false}
 error={null}
 onRetry={() => {}}
 students={(classDetail.data?.enrollments ?? []) as never}
 assessments={
 (allAssessments.data ?? [])
 .filter(
 (a) =>
 !classDetail.data?.levelId ||
 a.levelId ===
 (classDetail.data?.levelId ??
 classDetail.data?.level.id),
 )
 .slice(0, 8) as never
 }
 attempts={(gradebookAttempts.data ?? []) as never}
 onJump={(id, status) => {
 setView("queue");
 setFilter((status as never) ?? "SUBMITTED");
 setQueueSearch("");
 setSelectedId(id);
 }}
 />
 )}
 </Panel>);
}
