import type { ActivityQuestion } from './activity-question';
import {
FiFileText,
FiLayers,
FiPlus
} from 'react-icons/fi';
import { LessonEditorSection5 } from './lesson-editor-section5';
import { LessonEditorSection6 } from './lesson-editor-section6';
import { LessonEditorSection7 } from './lesson-editor-section7';
import { LessonEditorSection8 } from './lesson-editor-section8';
import { LessonEditorSection9 } from './lesson-editor-section9';
export function LessonEditorSection102(props: { edit: { title: string; contentType: string; body: string; videoUrl: string; audioUrl: string; estimatedMinutes: string; isPublished: boolean; }; setEdit: import("react").Dispatch<import("react").SetStateAction<{ title: string; contentType: string; body: string; videoUrl: string; audioUrl: string; estimatedMinutes: string; isPublished: boolean; }>>; fieldErrors: Record<string, string>; onFieldErrorsChange: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>; busy: boolean; onRun: (action: () => Promise<unknown>, fallback: string, after?: () => void) => Promise<void>; lessonId: string; onSaved: () => void; onDeleted: () => void; data: { title: string; contentType: string; body: string | null; videoUrl: string | null; audioUrl: string | null; estimatedMinutes: number | null; isPublished: boolean; materials: { id: string; title: string; type: string; url: string | null; isDownloadable: boolean; mimeType: string | null; }[]; activities: { id: string; title: string; type: string; instructions: string | null; order: number; isPublished: boolean; }[]; }; editingMaterialId: string | null; setEditingMaterialId: import("react").Dispatch<import("react").SetStateAction<string | null>>; startEditMaterial: (m: { id: string; title: string; type: string; url: string | null; isDownloadable: boolean; }) => void; materialDraft: { title: string; type: string; url: string; isDownloadable: boolean; }; setMaterialDraft: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; url: string; isDownloadable: boolean; }>>; setShowAddMaterial: import("react").Dispatch<import("react").SetStateAction<boolean>>; showAddMaterial: boolean; materialForm: { title: string; type: string; url: string; }; setMaterialForm: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; url: string; }>>; editingActivityId: string | null; setEditingActivityId: import("react").Dispatch<import("react").SetStateAction<string | null>>; startEditActivity: (a: { id: string; title: string; type: string; instructions: string | null; isPublished: boolean; }) => void; activityDraft: { title: string; type: string; instructions: string; isPublished: boolean; }; setActivityDraft: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; instructions: string; isPublished: boolean; }>>; setShowAddActivity: import("react").Dispatch<import("react").SetStateAction<boolean>>; showAddActivity: boolean; activityForm: { title: string; type: string; instructions: string; }; activityQ: ActivityQuestion; setActivityForm: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; instructions: string; }>>; setActivityQ: import("react").Dispatch<import("react").SetStateAction<ActivityQuestion>> }) {
const { edit, setEdit, fieldErrors, onFieldErrorsChange, busy, onRun, lessonId, onSaved, onDeleted, data, editingMaterialId, setEditingMaterialId, startEditMaterial, materialDraft, setMaterialDraft, setShowAddMaterial, showAddMaterial, materialForm, setMaterialForm, editingActivityId, setEditingActivityId, startEditActivity, activityDraft, setActivityDraft, setShowAddActivity, showAddActivity, activityForm, activityQ, setActivityForm, setActivityQ } = props;
return (<div className="space-y-6">
 {/* ── Lesson Details — distinct white card with brand accent ── */}
 <LessonEditorSection8 edit={edit} setEdit={setEdit} fieldErrors={fieldErrors} onFieldErrorsChange={onFieldErrorsChange} busy={busy} onRun={onRun} lessonId={lessonId} onSaved={onSaved} onDeleted={onDeleted} />

 {/* ── Divider: attached content — visually separates lesson form from extras ── */}
 <div className="relative flex items-center gap-3 py-1">
 <div className="h-px grow bg-line" aria-hidden />
 <span className="rounded-full border border-line bg-base-200 px-3 py-1 text-[11px] font-semibold tracking-widest text-muted">Attached content</span>
 <div className="h-px grow bg-line" aria-hidden />
 </div>

 {/* ── Materials — Canvas Files analogue · blue accent ─────── */}
 <div className="overflow-hidden rounded-box border border-line bg-base-100 border-l-4 border-l-info">
 <div className="border-b border-line bg-[#eff6ff] px-3 py-2.5">
 <div className="flex items-center justify-between gap-2">
 <h4 className="flex items-center gap-2 text-xs font-semibold">
 <FiFileText aria-hidden className="text-brand" />
 Resources
 <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-normal text-muted">
 {data.materials.length}
 </span>
 </h4>
 <span className="hidden text-[11px] text-muted sm:block">Files & links students use to learn</span>
 </div>
 <p className="mt-1 text-[11px] leading-snug text-muted">
 Notes, PDFs, slides, videos and links. Published lessons show their resources to enrolled students.
 </p>
 </div>

 <div className="p-3">
 {data.materials.length === 0 ? (
 <div className="rounded-box border border-dashed border-line bg-base-200/30 px-4 py-6 text-center">
 <FiFileText aria-hidden className="mx-auto text-xl text-muted" />
 <p className="mt-2 text-xs font-medium">No resources yet</p>
 <p className="mx-auto mt-1 max-w-sm text-[11px] leading-snug text-muted">
 Add the first file — e.g. a vocabulary PDF or a link to a video. Students see it inside this lesson.
 </p>
 </div>
 ) : (
 <LessonEditorSection6 data={data} editingMaterialId={editingMaterialId} setEditingMaterialId={setEditingMaterialId} startEditMaterial={startEditMaterial} onRun={onRun} onSaved={onSaved} materialDraft={materialDraft} setMaterialDraft={setMaterialDraft} busy={busy} />
 )}

 <button type="button" onClick={() => setShowAddMaterial(true)} className="mt-4 btn btn-sm gap-2 rounded-full border border-dashed border-info bg-[#eff6ff] text-info hover:bg-info hover:text-white">
 <FiPlus aria-hidden /> Add resource
 </button>

 {showAddMaterial ? (
 <LessonEditorSection9 setShowAddMaterial={setShowAddMaterial} onRun={onRun} lessonId={lessonId} materialForm={materialForm} setMaterialForm={setMaterialForm} onSaved={onSaved} busy={busy} />
 ) : null}
 </div>
 </div>

 {/* ── Activities — Canvas Assignments / Practice ───────────── */}
 <div className="rounded-box border border-line bg-base-100">
 <div className="border-b border-line bg-base-200/50 px-3 py-2">
 <div className="flex items-center justify-between gap-2">
 <h4 className="flex items-center gap-2 text-xs font-semibold">
 <FiLayers aria-hidden className="text-brand" />
 Practice activities
 <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-normal text-muted">{data.activities.length}</span>
 </h4>
 <span className="hidden text-[11px] text-muted sm:block">Tasks students do — auto-graded or teacher-graded</span>
 </div>
 <p className="mt-1 text-[11px] leading-snug text-muted">
 Vocabulary, listening, writing and speaking exercises. Published activities appear in the lesson for students.
 </p>
 </div>

 <div className="p-3">
 {data.activities.length === 0 ? (
 <div className="rounded-box border border-dashed border-line bg-base-200/30 px-4 py-6 text-center">
 <FiLayers aria-hidden className="mx-auto text-xl text-muted" />
 <p className="mt-2 text-xs font-medium">No activities yet</p>
 <p className="mx-auto mt-1 max-w-sm text-[11px] leading-snug text-muted">
 Add the first exercise — e.g. a vocabulary matching or a short writing task. Students complete it inside the lesson.
 </p>
 </div>
 ) : (
 <LessonEditorSection7 data={data} editingActivityId={editingActivityId} setEditingActivityId={setEditingActivityId} startEditActivity={startEditActivity} onRun={onRun} onSaved={onSaved} activityDraft={activityDraft} setActivityDraft={setActivityDraft} busy={busy} />
 )}

           <button type="button" onClick={() => setShowAddActivity(true)} className="mt-4 btn btn-sm gap-2 rounded-full border border-dashed border-sun bg-[#fffbeb] text-[#8A6800] hover:bg-sun hover:text-white">
             <FiPlus aria-hidden /> Add practice activity
           </button>

 {showAddActivity ? (
 <LessonEditorSection5 setShowAddActivity={setShowAddActivity} onRun={onRun} activityForm={activityForm} activityQ={activityQ} lessonId={lessonId} setActivityForm={setActivityForm} onSaved={onSaved} setActivityQ={setActivityQ} busy={busy} />
 ) : null}
 </div>
 </div>
 </div>);
}
