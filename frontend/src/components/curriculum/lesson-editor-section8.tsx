import {
FiBookOpen,
FiTrash2
} from 'react-icons/fi';
import {
deleteLesson,
humanize,
updateLesson
} from '../../lib/services';
import { RichTextEditor } from '../ui/RichTextEditor';
import { CONTENT_TYPES } from './content-types';
export function LessonEditorSection8(props: { edit: { title: string; contentType: string; body: string; videoUrl: string; audioUrl: string; estimatedMinutes: string; isPublished: boolean; }; setEdit: import("react").Dispatch<import("react").SetStateAction<{ title: string; contentType: string; body: string; videoUrl: string; audioUrl: string; estimatedMinutes: string; isPublished: boolean; }>>; fieldErrors: Record<string, string>; onFieldErrorsChange: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>; busy: boolean; onRun: (action: () => Promise<unknown>, fallback: string, after?: () => void) => Promise<void>; lessonId: string; onSaved: () => void; onDeleted: () => void }) {
const { edit, setEdit, fieldErrors, onFieldErrorsChange, busy, onRun, lessonId, onSaved, onDeleted } = props;
return (<div className="overflow-hidden rounded-box border border-line bg-base-100">
 <div className="flex items-center gap-3 border-b border-line bg-brand/[0.04] px-4 py-3">
 <span className="flex size-8 items-center justify-center rounded-full bg-brand text-white">
 <FiBookOpen aria-hidden />
 </span>
 <div>
 <h4 className="text-sm font-bold leading-none">Lesson details</h4>
 <p className="text-[11px] text-muted">Core content students read, watch or listen to</p>
 </div>
 <span className="ml-auto hidden items-center gap-1 rounded-full bg-base-200 px-2.5 py-1 text-[11px] font-medium text-muted sm:flex">
 <span className={`size-2 rounded-full ${edit.isPublished ? 'bg-success' : 'bg-muted'}`} aria-hidden />
 {edit.isPublished ? 'Published' : 'Draft'}
 </span>
 </div>
 <div className="space-y-4 p-4">
  <div className="grid gap-3 sm:grid-cols-2">
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Lesson title</span>
  <input value={edit.title} onChange={(e) => { const v = e.currentTarget.value; setEdit((f) => ({ ...f, title: v })); if (fieldErrors.title) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.title; return n; }) }} placeholder="e.g. Greetings & Introductions" className={`input input w-full rounded-field bg-base-100 ${fieldErrors.title ? 'input-error border-error' : 'border-line'}`} aria-invalid={Boolean(fieldErrors.title)} />
  {fieldErrors.title ? <p className="mt-1 text-xs text-error">{fieldErrors.title}</p> : null}
  </label>
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Content type</span>
  <select value={edit.contentType} onChange={(e) => { const v = e.currentTarget.value; setEdit((f) => ({ ...f, contentType: v })); if (fieldErrors.contentType) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.contentType; return n; }) }} className={`select select w-full rounded-field bg-base-100 ${fieldErrors.contentType ? 'select-error border-error' : 'border-line'}`}>
  {CONTENT_TYPES.map((t) => (
  <option key={t} value={t}>
  {humanize(t)}
  </option>
  ))}
  </select>
  {fieldErrors.contentType ? <p className="mt-1 text-xs text-error">{fieldErrors.contentType}</p> : null}
  </label>
  </div>
  <div className="grid gap-3 sm:grid-cols-2">
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Duration (minutes)</span>
  <input value={edit.estimatedMinutes} onChange={(e) => { const v = e.currentTarget.value; setEdit((f) => ({ ...f, estimatedMinutes: v })); if (fieldErrors.estimatedMinutes) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.estimatedMinutes; return n; }) }} inputMode="numeric" placeholder="e.g. 30" className={`input input w-full rounded-field bg-base-100 ${fieldErrors.estimatedMinutes ? 'input-error border-error' : 'border-line'}`} />
  {fieldErrors.estimatedMinutes ? <p className="mt-1 text-xs text-error">{fieldErrors.estimatedMinutes}</p> : null}
  </label>
  <label className="flex items-center gap-2 pt-6 text-xs font-medium">
  <input type="checkbox" className="checkbox checkbox-sm" checked={edit.isPublished} onChange={(e) => { const v = e.currentTarget.checked; setEdit((f) => ({ ...f, isPublished: v })) }} />
  Published — visible to students
  </label>
  </div>
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Lesson notes — rich text</span>
  <RichTextEditor value={edit.body} onChange={(html) => { setEdit((f) => ({ ...f, body: html })); if (fieldErrors.body) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.body; return n; }) }} placeholder="Write the lesson content — bold, colors, headings, lists, images…" error={fieldErrors.body ?? null} />
  </label>
  <div className="grid gap-3 sm:grid-cols-2">
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Video URL</span>
  <input value={edit.videoUrl} onChange={(e) => { const v = e.currentTarget.value; setEdit((f) => ({ ...f, videoUrl: v })); if (fieldErrors.videoUrl) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.videoUrl; return n; }) }} placeholder="https://youtube.com/..." className={`input input w-full rounded-field bg-base-100 ${fieldErrors.videoUrl ? 'input-error border-error' : 'border-line'}`} aria-invalid={Boolean(fieldErrors.videoUrl)} />
  {fieldErrors.videoUrl ? <p className="mt-1 text-xs text-error">{fieldErrors.videoUrl}</p> : null}
  </label>
  <label className="block">
  <span className="mb-1.5 block text-xs font-medium">Audio URL</span>
  <input value={edit.audioUrl} onChange={(e) => { const v = e.currentTarget.value; setEdit((f) => ({ ...f, audioUrl: v })); if (fieldErrors.audioUrl) onFieldErrorsChange((prev) => { const n = { ...prev }; delete n.audioUrl; return n; }) }} placeholder="https://..." className={`input input w-full rounded-field bg-base-100 ${fieldErrors.audioUrl ? 'input-error border-error' : 'border-line'}`} aria-invalid={Boolean(fieldErrors.audioUrl)} />
  {fieldErrors.audioUrl ? <p className="mt-1 text-xs text-error">{fieldErrors.audioUrl}</p> : null}
  </label>
  </div>

  <div className="flex flex-wrap gap-2">
  <button
  type="button"
  disabled={busy}
  onClick={() =>
  onRun(
  () =>
  updateLesson(lessonId, {
  title: edit.title.trim(),
  contentType: edit.contentType,
  body: edit.body.trim() || null,
  videoUrl: edit.videoUrl.trim() || null,
  audioUrl: edit.audioUrl.trim() || null,
  estimatedMinutes: edit.estimatedMinutes ? Number(edit.estimatedMinutes) : null,
  isPublished: edit.isPublished,
  }),
  'Could not save the lesson.',
  onSaved,
  )
  }
  className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60"
  >
  {busy ? <span className="loading loading-spinner loading-xs" /> : null} Save lesson
  </button>
  <button
  type="button"
  disabled={busy}
  onClick={() => onRun(() => deleteLesson(lessonId), 'Could not delete the lesson.', onDeleted)}
  className="btn btn-sm gap-1 rounded-full border-0 bg-coral text-white hover:bg-coral hover:text-error-content disabled:opacity-60"
  >
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiTrash2 aria-hidden />} Delete lesson
  </button>
  </div>
 </div>
 </div>);
}
