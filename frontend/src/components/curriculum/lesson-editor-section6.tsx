import {
FiCheck,
FiDownload,
FiEdit2,
FiFileText,
FiLink,
FiTrash2,
FiX
} from 'react-icons/fi';
import {
humanize
} from '../../lib/services';
import { materialIcon } from './material-icon';
import { MATERIAL_TYPES } from './material-types';
export function LessonEditorSection6(props: { data: { title: string; contentType: string; body: string | null; videoUrl: string | null; audioUrl: string | null; estimatedMinutes: number | null; isPublished: boolean; materials: { id: string; title: string; type: string; url: string | null; isDownloadable: boolean; mimeType: string | null; }[]; activities: { id: string; title: string; type: string; instructions: string | null; order: number; isPublished: boolean; }[]; }; editingMaterialId: string | null; setEditingMaterialId: import("react").Dispatch<import("react").SetStateAction<string | null>>; startEditMaterial: (m: { id: string; title: string; type: string; url: string | null; isDownloadable: boolean; }) => void; onRun: (action: () => Promise<unknown>, fallback: string, after?: () => void) => Promise<void>; onSaved: () => void; materialDraft: { title: string; type: string; url: string; isDownloadable: boolean; }; setMaterialDraft: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; url: string; isDownloadable: boolean; }>>; busy: boolean }) {
const { data, editingMaterialId, setEditingMaterialId, startEditMaterial, onRun, onSaved, materialDraft, setMaterialDraft, busy } = props;
return (<ul className="space-y-2">
 {data.materials.map((m) => {
 const Icon = materialIcon(m.type);
 const isEditing = editingMaterialId === m.id;
 return (
 <li key={m.id} className="overflow-hidden rounded-box border border-line bg-base-100">
 <div className="flex items-center gap-3 px-3 py-2.5">
 <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-base-200 text-muted">
 <Icon aria-hidden className="text-sm" />
 </span>
 <span className="min-w-0 grow">
 <span className="block truncate text-xs font-medium leading-tight">{m.title}</span>
 <span className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
 <span className="rounded-full bg-base-200 px-2 py-0.5">{humanize(m.type)}</span>
 {m.url ? (
 <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 truncate font-medium text-brand hover:underline">
 <FiLink aria-hidden className="shrink-0" />
 <span className="max-w-[14rem] truncate">{m.url}</span>
 </a>
 ) : (
 <span className="italic">No URL — upload a file</span>
 )}
 {m.isDownloadable ? (
 <span className="inline-flex items-center gap-1">
 <FiDownload aria-hidden className="text-[11px]" />
 Downloadable
 </span>
 ) : null}
 </span>
 </span>
 <span className="flex shrink-0 items-center gap-1">
 <button
 type="button"
 onClick={() => (isEditing ? setEditingMaterialId(null) : startEditMaterial(m))}
 className="btn btn-ghost btn-xs btn-circle"
 aria-label={isEditing ? 'Cancel edit' : `Edit ${m.title}`}
 >
 {isEditing ? <FiX aria-hidden /> : <FiEdit2 aria-hidden />}
 </button>
 <button
 type="button"
 onClick={() => {
 if (!confirm(`Delete "${m.title}"?`)) return;
 void onRun(() => import('../../lib/services').then((s) => s.deleteMaterial(m.id)), 'Could not delete the resource.', onSaved);
 }}
 className="btn btn-ghost btn-xs btn-circle text-coral"
 aria-label={`Delete ${m.title}`}
 >
 <FiTrash2 aria-hidden />
 </button>
 </span>
 </div>

 {isEditing ? (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={() => setEditingMaterialId(null)} className="absolute inset-0 bg-black/40 " />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 void onRun(
 () =>
 import('../../lib/services').then((s) =>
 s.updateMaterial(m.id, {
 title: materialDraft.title.trim(),
 type: materialDraft.type,
 url: materialDraft.url.trim() || null,
 isDownloadable: materialDraft.isDownloadable,
 }),
 ),
 'Could not save the resource.',
 () => {
 setEditingMaterialId(null);
 onSaved();
 },
 );
 }}
 className="relative w-full max-w-lg rounded-box bg-base-100 p-5"
 >
 <button type="button" onClick={() => setEditingMaterialId(null)} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3">
 <FiX aria-hidden />
 </button>
 <h4 className="flex items-center gap-2 text-sm font-bold">
 <span className="flex size-7 items-center justify-center rounded-full bg-info text-white">
 <FiFileText aria-hidden />
 </span>
 Edit resource
 </h4>
 <p className="mt-1 text-xs text-muted">Update the file details — changes are visible to students immediately.</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Title</span>
 <input required value={materialDraft.title} onChange={(e) => { const v = e.currentTarget.value; setMaterialDraft((f) => ({ ...f, title: v })) }} className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Type</span>
 <select value={materialDraft.type} onChange={(e) => { const v = e.currentTarget.value; setMaterialDraft((f) => ({ ...f, type: v })) }} className="select select w-full rounded-field border-line bg-base-100">
 {MATERIAL_TYPES.map((t) => (
 <option key={t} value={t}>
 {humanize(t)}
 </option>
 ))}
 </select>
 </label>
 </div>
 <label className="block">
 <span className="mb-1 mt-3 block text-xs font-medium">URL</span>
 <input value={materialDraft.url} onChange={(e) => { const v = e.currentTarget.value; setMaterialDraft((f) => ({ ...f, url: v })) }} placeholder="https://..." className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="mt-3 flex items-center gap-2 text-xs font-medium">
 <input type="checkbox" className="checkbox checkbox-xs" checked={materialDraft.isDownloadable} onChange={(e) => { const v = e.currentTarget.checked; setMaterialDraft((f) => ({ ...f, isDownloadable: v })) }} />
 Downloadable for students
 </label>
 <div className="mt-4 flex justify-end gap-2">
 <button type="button" onClick={() => setEditingMaterialId(null)} className="btn btn-sm rounded-full border-line bg-base-100">
 Cancel
 </button>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60">
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
