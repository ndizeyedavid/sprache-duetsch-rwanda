import {
FiFileText,
FiPlus,
FiX
} from 'react-icons/fi';
import {
createMaterial,
humanize,
uploadFile
} from '../../lib/services';
import { MATERIAL_TYPES } from './material-types';
export function LessonEditorSection9(props: { setShowAddMaterial: import("react").Dispatch<import("react").SetStateAction<boolean>>; onRun: (action: () => Promise<unknown>, fallback: string, after?: () => void) => Promise<void>; lessonId: string; materialForm: { title: string; type: string; url: string; }; setMaterialForm: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; url: string; }>>; onSaved: () => void; busy: boolean }) {
const { setShowAddMaterial, onRun, lessonId, materialForm, setMaterialForm, onSaved, busy } = props;
return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={() => setShowAddMaterial(false)} className="absolute inset-0 bg-black/40 " />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 void onRun(
 () =>
 createMaterial(lessonId, {
 title: materialForm.title.trim(),
 type: materialForm.type,
 url: materialForm.url.trim() || undefined,
 isDownloadable: true,
 }),
 'Could not add the resource.',
 () => {
 setMaterialForm({ title: '', type: 'NOTE', url: '' });
 setShowAddMaterial(false);
 onSaved();
 },
 );
 }}
 className="relative w-full max-w-lg rounded-box bg-base-100 p-5"
 >
 <button type="button" onClick={() => setShowAddMaterial(false)} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3">
 <FiX aria-hidden />
 </button>
 <h4 className="flex items-center gap-2 text-sm font-bold">
 <span className="flex size-7 items-center justify-center rounded-full bg-info text-white">
 <FiFileText aria-hidden />
 </span>
 Add resource
 </h4>
 <p className="mt-1 text-xs text-muted">A file, link or note students will see inside this lesson.</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Title</span>
 <input required value={materialForm.title} onChange={(e) => { const v = e.currentTarget.value; setMaterialForm((f) => ({ ...f, title: v })) }} placeholder="e.g. Vocabulary List — Greetings" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Type</span>
 <select value={materialForm.type} onChange={(e) => { const v = e.currentTarget.value; setMaterialForm((f) => ({ ...f, type: v })) }} className="select select w-full rounded-field border-line bg-base-100">
 {MATERIAL_TYPES.map((t) => (
 <option key={t} value={t}>
 {humanize(t)}
 </option>
 ))}
 </select>
 </label>
 </div>
 <label className="block">
 <span className="mb-1 mt-3 block text-xs font-medium">Link</span>
 <input value={materialForm.url} onChange={(e) => { const v = e.currentTarget.value; setMaterialForm((f) => ({ ...f, url: v })) }} placeholder="https://... or leave empty and upload" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <div className="mt-3 flex flex-wrap items-center gap-2">
 <label className="btn btn-sm gap-1 rounded-full border-line bg-base-100">
 <FiFileText aria-hidden /> Upload file
 <input
 type="file"
 className="hidden"
 onChange={(e) => {
 const file = e.currentTarget.files?.[0];
 if (!file) return;
 void onRun(
 async () => {
 const result = await uploadFile(file);
 setMaterialForm((f) => ({ ...f, url: result.url }));
 },
 'Could not upload the file.',
 );
 }}
 />
 </label>
 {materialForm.url ? <span className="truncate text-xs text-muted">Linked: {materialForm.url}</span> : null}
 </div>
 <div className="mt-4 flex justify-end gap-2">
 <button type="button" onClick={() => setShowAddMaterial(false)} className="btn btn-sm rounded-full border-line bg-base-100">
 Cancel
 </button>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />} Add resource
  </button>
 </div>
 </form>
 </div>);
}
