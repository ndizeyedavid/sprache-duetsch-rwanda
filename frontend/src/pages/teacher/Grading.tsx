import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiAward, FiFilter, FiX } from "react-icons/fi";
import { Panel, SectionHeader } from "../../components/ui/Panel";
import {
 EmptyBlock,
 ErrorBlock,
 LoadingBlock,
} from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { apiErrorMessage } from "../../lib/api";
import {
 getClass,
 getStaffAttempt,
 gradeAttempt,
 humanize,
 listAssessments,
 listAttempts,
 listClasses,
} from "../../lib/services";
import { FILTERS } from "../../components/grading/constants";
import type { Filter, View } from "../../components/grading/constants";
import { QueueList } from "../../components/grading/QueueList";
import { GradingDetail } from "../../components/grading/GradingDetail";
import { GradebookPanel } from "../../components/grading/GradebookPanel";
import { ActivityGradingPanel } from "../../components/teacher/ActivityGradingPanel";

export function TeacherGrading() {
 const [searchParams, setSearchParams] = useSearchParams();
 const initialClass = searchParams.get("classGroupId");
 const initialStatus = searchParams.get("status") as Filter | null;
 const initialAssessment = searchParams.get("assessmentId");
 const [filter, setFilter] = useState<Filter>(
 initialStatus && (FILTERS as readonly string[]).includes(initialStatus)
 ? initialStatus
 : "SUBMITTED",
 );
 const [classGroupId, setClassGroupId] = useState<string | null>(initialClass);
 const [assessmentId, setAssessmentId] = useState<string | null>(
 initialAssessment,
 );
 const [view, setView] = useState<View>("queue");
 const [queueSearch, setQueueSearch] = useState("");

 const classes = useApi("teacher-classes", listClasses);
 const attempts = useApi(
 `attempts-${filter}-${classGroupId ?? "all"}-${assessmentId ?? "all"}`,
 () =>
 listAttempts(
 filter,
 classGroupId ?? undefined,
 assessmentId ?? undefined,
 ),
 );
 const assessmentOptions = useApi("assessments-for-filter", listAssessments);
 const [selectedId, setSelectedId] = useState<string | null>(null);
 const detail = useApi(
 `attempt-${selectedId ?? "none"}`,
 () => getStaffAttempt(selectedId ?? ""),
 selectedId !== null,
 );

 const [points, setPoints] = useState<Record<string, string>>({});
 const [feedback, setFeedback] = useState<Record<string, string>>({});
 const [overall, setOverall] = useState("");
 const [passed, setPassed] = useState(true);
 const [saveError, setSaveError] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);
 const [saved, setSaved] = useState(false);

 useEffect(() => {
 const a = detail.data;
 if (!a) return;
 setPoints(
 Object.fromEntries(
 (a.answers ?? []).map((x) => [x.id, String(x.pointsAwarded)]),
 ),
 );
 setFeedback(
 Object.fromEntries(
 (a.answers ?? []).map((x) => [x.id, x.feedback ?? ""]),
 ),
 );
 setOverall(a.feedback ?? "");
 setPassed(a.passed ?? true);
 setSaved(false);
 setSaveError(null);
 }, [detail.data]);

 useEffect(() => {
 const p = new URLSearchParams();
 p.set("status", filter);
 if (classGroupId) p.set("classGroupId", classGroupId);
 if (assessmentId) p.set("assessmentId", assessmentId);
 setSearchParams(p, { replace: true });
 }, [filter, classGroupId, assessmentId, setSearchParams]);

 const list = useMemo(() => {
 let out = attempts.data ?? [];
 if (queueSearch.trim()) {
 const q = queueSearch.trim().toLowerCase();
 out = out.filter((a) =>
 `${a.student.user.firstName} ${a.student.user.lastName} ${a.student.studentCode} ${a.assessment.title}`
 .toLowerCase()
 .includes(q),
 );
 }
 return out;
 }, [attempts.data, queueSearch]);

 const selectedIndex = list.findIndex((a) => a.id === selectedId);
 function go(delta: number) {
 const n = selectedIndex + delta;
 if (n >= 0 && n < list.length) setSelectedId(list[n].id);
 }

 const classDetail = useApi(
 `class-${classGroupId ?? "none"}`,
 () => getClass(classGroupId ?? ""),
 Boolean(classGroupId) && view === "gradebook",
 );
 const allAssessments = useApi(
 "assessments-all",
 listAssessments,
 view === "gradebook",
 );
 const gradebookAttempts = useApi(
 `gradebook-attempts-${classGroupId ?? "none"}`,
 () => listAttempts(undefined, classGroupId ?? undefined),
 view === "gradebook" && Boolean(classGroupId),
 );

 async function doSave(nextId?: string | null) {
 if (!selectedId || !detail.data) return;
 setSaving(true);
 setSaveError(null);
 try {
 await gradeAttempt(selectedId, {
 answers: (detail.data.answers ?? []).map((a) => ({
 answerId: a.id,
 pointsAwarded: Number(points[a.id] ?? a.pointsAwarded),
 feedback: feedback[a.id]?.trim() || undefined,
 })),
 feedback: overall.trim() || undefined,
 passed,
 });
 setSaved(true);
 attempts.refetch();
 detail.refetch();
 if (nextId !== undefined) setSelectedId(nextId);
 } catch (err) {
 setSaveError(apiErrorMessage(err, "Could not save."));
 } finally {
 setSaving(false);
 }
 }

 const selectedAssessment = assessmentId
 ? (assessmentOptions.data ?? []).find((a) => a.id === assessmentId)
 : null;
 const pendingCount = (attempts.data ?? []).length;

 return (
 <div className="space-y-4">
 <Panel>
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h1 className="flex items-center gap-2 text-base font-bold">
 <FiAward aria-hidden className="text-brand" />
 Grading — SpeedGrader
 </h1>
 <p className="mt-1 text-xs leading-snug text-muted">
 Queue on the left, grading canvas on the right. Filter by class or
 assessment, search, then grade and hit Save & next.
 </p>
 </div>
 <span className="rounded-full bg-coral-soft px-3 py-1 text-xs font-semibold text-[#D8482F]">
 {pendingCount} to grade
 </span>
 </div>
 <div className="mt-3 flex flex-wrap items-center gap-2">
 <select
 value={classGroupId ?? ""}
 onChange={(e) => {
 setClassGroupId(e.currentTarget.value || null);
 setSelectedId(null);
 }}
 className="select select-sm rounded-full border-line bg-base-200"
 aria-label="Filter by class"
 >
 <option value="">All my classes</option>
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
 <div className="mt-3 flex flex-wrap items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-4 py-2 text-xs">
 <FiFilter aria-hidden className="text-brand" />
 <span className="font-medium text-[#B30A00]">Filtered:</span>
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
 </Panel>

  {view === "activities" ? (
  <Panel>
  <SectionHeader title="Lesson activities" />
  <p className="mb-3 text-xs leading-snug text-muted">
  Submissions from lesson practice activities across your levels. Grade, give feedback and track completion here.
  </p>
  <ActivityGradingPanel />
  </Panel>
  ) : null}

  {view === "gradebook" ? (
  <Panel>
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
 </Panel>
 ) : null}

  <div
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
 </div>
 </div>
 );
}
