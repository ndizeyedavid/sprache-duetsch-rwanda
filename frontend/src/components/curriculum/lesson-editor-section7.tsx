import {
FiCheck,
FiEdit2,
FiLayers,
FiTrash2,
FiX
} from 'react-icons/fi';
import {
humanize
} from '../../lib/services';
import { ACTIVITY_TYPES } from './activity-types';
export function LessonEditorSection7(props: { data: { title: string; contentType: string; body: string | null; videoUrl: string | null; audioUrl: string | null; estimatedMinutes: number | null; isPublished: boolean; materials: { id: string; title: string; type: string; url: string | null; isDownloadable: boolean; mimeType: string | null; }[]; activities: { id: string; title: string; type: string; instructions: string | null; order: number; isPublished: boolean; }[]; }; editingActivityId: string | null; setEditingActivityId: import("react").Dispatch<import("react").SetStateAction<string | null>>; startEditActivity: (a: { id: string; title: string; type: string; instructions: string | null; isPublished: boolean; }) => void; onRun: (action: () => Promise<unknown>, fallback: string, after?: () => void) => Promise<void>; onSaved: () => void; activityDraft: { title: string; type: string; instructions: string; isPublished: boolean; }; setActivityDraft: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; instructions: string; isPublished: boolean; }>>; busy: boolean }) {
const { data, editingActivityId, setEditingActivityId, startEditActivity, onRun, onSaved, activityDraft, setActivityDraft, busy } = props;
return (<ul className="space-y-2">
 {[...data.activities]
 .sort((a, b) => a.order - b.order)
 .map((a) => {
 const isEditing = editingActivityId === a.id;
 return (
 <li key={a.id} className="overflow-hidden rounded-box border border-line bg-base-100">
 <div className="flex items-center gap-3 px-3 py-2.5">
 <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${a.isPublished ? 'bg-brand-soft text-brand' : 'bg-base-200 text-muted'}`}>
 <FiLayers aria-hidden className="text-xs" />
 </span>
 <span className="min-w-0 grow">
 <span className="flex flex-wrap items-center gap-2">
 <span className="truncate text-xs font-medium leading-tight">{a.title}</span>
 <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px]">{humanize(a.type)}</span>
 {a.isPublished ? (
 <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">Published</span>
 ) : (
 <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] text-muted">Draft</span>
 )}
 </span>
 {a.instructions ? (
 <span className="mt-0.5 line-clamp-1 block text-[11px] text-muted">{a.instructions}</span>
 ) : null}
 <span className="text-[11px] text-muted">Order {a.order}</span>
 </span>
 <span className="flex shrink-0 items-center gap-1">
 <button
 type="button"
 onClick={() => (isEditing ? setEditingActivityId(null) : startEditActivity(a))}
 className="btn btn-ghost btn-xs btn-circle"
 aria-label={isEditing ? 'Cancel edit' : `Edit ${a.title}`}
 >
 {isEditing ? <FiX aria-hidden /> : <FiEdit2 aria-hidden />}
 </button>
 <button
 type="button"
 onClick={() => {
 if (!confirm(`Delete "${a.title}"?`)) return;
 void onRun(() => import('../../lib/services').then((s) => s.deleteActivity(a.id)), 'Could not delete the activity.', onSaved);
 }}
 className="btn btn-ghost btn-xs btn-circle text-coral"
 aria-label={`Delete ${a.title}`}
 >
 <FiTrash2 aria-hidden />
 </button>
 </span>
 </div>

 {isEditing ? (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={() => setEditingActivityId(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 void onRun(
 () =>
 import('../../lib/services').then((s) =>
 s.updateActivity(a.id, {
 title: activityDraft.title.trim(),
 type: activityDraft.type,
 instructions: activityDraft.instructions.trim() || null,
 isPublished: activityDraft.isPublished,
 }),
 ),
 'Could not save the activity.',
 () => {
 setEditingActivityId(null);
 onSaved();
 },
 );
 }}
 className="relative w-full max-w-lg rounded-box bg-base-100 p-5"
 >
 <button type="button" onClick={() => setEditingActivityId(null)} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3">
 <FiX aria-hidden />
 </button>
 <h4 className="flex items-center gap-2 text-sm font-bold">
 <span className="flex size-7 items-center justify-center rounded-full bg-sun text-white">
 <FiLayers aria-hidden />
 </span>
 Edit activity
 </h4>
 <p className="mt-1 text-xs text-muted">Update instructions or publish state for this practice task.</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Title</span>
 <input required value={activityDraft.title} onChange={(e) => { const v = e.currentTarget.value; setActivityDraft((f) => ({ ...f, title: v })) }} className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Type</span>
 <select value={activityDraft.type} onChange={(e) => { const v = e.currentTarget.value; setActivityDraft((f) => ({ ...f, type: v })) }} className="select select w-full rounded-field border-line bg-base-100">
 {ACTIVITY_TYPES.map((t) => (
 <option key={t.value} value={t.value}>
 {t.label}
 </option>
 ))}
 </select>
 </label>
 </div>
 <label className="block">
 <span className="mb-1 mt-3 block text-xs font-medium">Instructions</span>
 <input value={activityDraft.instructions} onChange={(e) => { const v = e.currentTarget.value; setActivityDraft((f) => ({ ...f, instructions: v })) }} placeholder="What should the student do?" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="mt-3 flex items-center gap-2 text-xs font-medium">
 <input type="checkbox" className="checkbox checkbox-xs" checked={activityDraft.isPublished} onChange={(e) => { const v = e.currentTarget.checked; setActivityDraft((f) => ({ ...f, isPublished: v })) }} />
 Published — visible to students
 </label>
 <div className="mt-4 flex justify-end gap-2">
 <button type="button" onClick={() => setEditingActivityId(null)} className="btn btn-sm rounded-full border-line bg-base-100">
 Cancel
 </button>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />} Save changes
  </button>
 </div>
 </form>
 </div>
 ) : null}
 </li>
 );
 })}
 </ul>);
}
