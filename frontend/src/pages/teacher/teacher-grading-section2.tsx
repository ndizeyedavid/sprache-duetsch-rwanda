import { GradingDetail } from "../../components/grading/GradingDetail";
import { QueueList } from "../../components/grading/QueueList";
import { Panel,SectionHeader } from "../../components/ui/Panel";
export function TeacherGradingSection2(props: { view: "queue" | "activities" | "gradebook"; list: { id: string; status: string; attemptNumber: number; score: number | null; maxScore: import("../../lib/services").Money; passed: boolean | null; submittedAt: string | null; student: { studentCode: string; user: { firstName: string; lastName: string; }; }; assessment: { id: string; title: string; }; }[]; attempts: import("../../hooks/useApi").ApiState<{ id: string; status: string; attemptNumber: number; score: number | null; maxScore: import("../../lib/services").Money; passed: boolean | null; submittedAt: string | null; student: { studentCode: string; user: { firstName: string; lastName: string; }; }; assessment: { id: string; title: string; }; }[]>; filter: "SUBMITTED" | "GRADED" | "IN_PROGRESS"; setFilter: import("react").Dispatch<import("react").SetStateAction<"SUBMITTED" | "GRADED" | "IN_PROGRESS">>; setSelectedId: import("react").Dispatch<import("react").SetStateAction<string | null>>; setQueueSearch: import("react").Dispatch<import("react").SetStateAction<string>>; queueSearch: string; selectedId: string | null; detail: import("../../hooks/useApi").ApiState<import("../../lib/services").StaffAttempt>; selectedIndex: number; go: (delta: number) => void; points: Record<string, string>; setPoints: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>; feedback: Record<string, string>; setFeedback: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>; overall: string; setOverall: import("react").Dispatch<import("react").SetStateAction<string>>; passed: boolean; setPassed: import("react").Dispatch<import("react").SetStateAction<boolean>>; saveError: string | null; saved: boolean; saving: boolean; doSave: (nextId?: string | null) => Promise<void> }) {
const { view, list, attempts, filter, setFilter, setSelectedId, setQueueSearch, queueSearch, selectedId, detail, selectedIndex, go, points, setPoints, feedback, setFeedback, overall, setOverall, passed, setPassed, saveError, saved, saving, doSave } = props;
return (<div
  className={`grid gap-5 lg:grid-cols-12 ${view === "gradebook" || view === "activities" ? "hidden lg:grid" : ""}`}
  >
 <Panel className="lg:col-span-4 xl:col-span-4">
 <SectionHeader
 title={`Submissions · ${list.length}`}
 className="mb-0"
 />
 <div className="mt-3">
 <QueueList
 attempts={list as never}
 loading={attempts.loading}
 error={attempts.error}
 onRetry={attempts.refetch}
 filter={filter}
 onFilter={(f) => {
 setFilter(f);
 setSelectedId(null);
 setQueueSearch("");
 }}
 search={queueSearch}
 onSearch={setQueueSearch}
 selectedId={selectedId}
 onPick={setSelectedId}
 />
 </div>
 </Panel>
 <Panel className="lg:col-span-8 xl:col-span-8">
 <GradingDetail
 selectedId={selectedId}
 loading={detail.loading}
 error={detail.error}
 data={detail.data as never}
 onRetry={detail.refetch}
 index={selectedIndex}
 total={list.length}
 onPrev={() => go(-1)}
 onNext={() => go(1)}
 points={points}
 onPoints={(id, v) => setPoints((p) => ({ ...p, [id]: v }))}
 feedback={feedback}
 onFeedback={(id, v) => setFeedback((p) => ({ ...p, [id]: v }))}
 overall={overall}
 onOverall={setOverall}
 passed={passed}
 onPassed={setPassed}
 saveError={saveError}
 saved={saved}
 saving={saving}
 onSave={() => void doSave()}
 onSaveAndNext={() => {
 const n = selectedIndex + 1;
 void doSave(n < list.length ? list[n].id : null);
 if (n < list.length) setSelectedId(list[n].id);
 }}
 />
 </Panel>
 </div>);
}
