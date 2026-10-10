import { useEffect,useMemo,useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Filter,View } from "../../components/grading/constants";
import { FILTERS } from "../../components/grading/constants";
import { ActivityGradingPanel } from "../../components/teacher/ActivityGradingPanel";
import { Panel,SectionHeader } from "../../components/ui/Panel";
import { useApi } from "../../hooks/useApi";
import {
getClass,
getStaffAttempt,
listAssessments,
listAttempts,
listClasses
} from "../../lib/services";
import { createDoSave } from './teacher-grading-do-save';
import { TeacherGradingSection1 } from './teacher-grading-section1';
import { TeacherGradingSection2 } from './teacher-grading-section2';
import { TeacherGradingSection3 } from './teacher-grading-section3';
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
 const [view, setView] = useState<View>(searchParams.get("view") === "activities" ? "activities" : "queue");
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

 const doSave = (...args: Parameters<ReturnType<typeof createDoSave>>) => createDoSave({ passed, selectedId, detail, setSaving, setSaveError, points, feedback, overall, setSaved, attempts, setSelectedId })(...args);

 const selectedAssessment = assessmentId
 ? (assessmentOptions.data ?? []).find((a) => a.id === assessmentId)
 : null;
 const pendingCount = (attempts.data ?? []).length;

 return (
 <div className="space-y-4">
 <TeacherGradingSection1 pendingCount={pendingCount} classGroupId={classGroupId} setClassGroupId={setClassGroupId} setSelectedId={setSelectedId} classes={classes} assessmentId={assessmentId} setAssessmentId={setAssessmentId} assessmentOptions={assessmentOptions} setView={setView} view={view} selectedAssessment={selectedAssessment} />

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
  <TeacherGradingSection3 classGroupId={classGroupId} classDetail={classDetail} allAssessments={allAssessments} gradebookAttempts={gradebookAttempts} setView={setView} setFilter={setFilter} setQueueSearch={setQueueSearch} setSelectedId={setSelectedId} />
 ) : null}

  <TeacherGradingSection2 view={view} list={list} attempts={attempts} filter={filter} setFilter={setFilter} setSelectedId={setSelectedId} setQueueSearch={setQueueSearch} queueSearch={queueSearch} selectedId={selectedId} detail={detail} selectedIndex={selectedIndex} go={go} points={points} setPoints={setPoints} feedback={feedback} setFeedback={setFeedback} overall={overall} setOverall={setOverall} passed={passed} setPassed={setPassed} saveError={saveError} saved={saved} saving={saving} doSave={doSave} />
 </div>
 );
}
