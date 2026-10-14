import {
FiLayers,
FiPlus,
FiX
} from 'react-icons/fi';
import {
createActivity
} from '../../lib/services';
import type { ActivityQuestion } from './activity-question';
import { ACTIVITY_TYPES } from './activity-types';
import { buildActivityConfig } from './build-activity-config';
export function LessonEditorSection5(props: { setShowAddActivity: import("react").Dispatch<import("react").SetStateAction<boolean>>; onRun: (action: () => Promise<unknown>, fallback: string, after?: () => void) => Promise<void>; activityForm: { title: string; type: string; instructions: string; }; activityQ: ActivityQuestion; lessonId: string; setActivityForm: import("react").Dispatch<import("react").SetStateAction<{ title: string; type: string; instructions: string; }>>; onSaved: () => void; setActivityQ: import("react").Dispatch<import("react").SetStateAction<ActivityQuestion>>; busy: boolean }) {
const { setShowAddActivity, onRun, activityForm, activityQ, lessonId, setActivityForm, onSaved, setActivityQ, busy } = props;
return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={() => setShowAddActivity(false)} className="absolute inset-0 bg-black/40 " />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 void onRun(
 () => {
 const { backendType, config } = buildActivityConfig(activityForm.type, activityQ, activityForm.instructions.trim() || '');
 return createActivity(lessonId, {
 title: activityForm.title.trim(),
 type: backendType,
 instructions: activityForm.instructions.trim() || undefined,
 isPublished: true,
 config,
 });
 },
 'Could not add the activity.',
 () => {
 setActivityForm({ title: '', type: 'MCQ', instructions: '' });
 setShowAddActivity(false);
 onSaved();
 },
 );
 }}
 className="relative w-full max-w-lg rounded-box bg-base-100 p-5"
 >
 <button type="button" onClick={() => setShowAddActivity(false)} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3">
 <FiX aria-hidden />
 </button>
 <h4 className="flex items-center gap-2 text-sm font-bold">
 <span className="flex size-7 items-center justify-center rounded-full bg-sun text-white">
 <FiLayers aria-hidden />
 </span>
 Add practice activity
 </h4>
 <p className="mt-1 text-xs text-muted">A task students complete and submit — you grade it or it auto-grades.</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Title</span>
 <input required value={activityForm.title} onChange={(e) => { const v = e.currentTarget.value; setActivityForm((f) => ({ ...f, title: v })) }} placeholder="e.g. Greetings Quiz" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-xs font-medium">Type</span>
 <select
 value={activityForm.type}
 onChange={(e) => {
 const v = e.currentTarget.value;
 setActivityForm((f) => ({ ...f, type: v }));
 if (v === 'MCQ') setActivityQ({ kind: 'MCQ', question: '', options: ['', '', '', ''], correctIndex: 0 });
 else if (v === 'FILL_BLANK') setActivityQ({ kind: 'FILL_BLANK', sentence: '', answer: '' });
 else if (v === 'TRUE_FALSE') setActivityQ({ kind: 'TRUE_FALSE', statement: '', correct: true });
 else if (v === 'WRITING') setActivityQ({ kind: 'WRITING', prompt: '', minWords: '' });
 else if (v === 'DOCUMENT') setActivityQ({ kind: 'DOCUMENT', prompt: '', allowedTypes: 'pdf,docx' });
 }}
 className="select select w-full rounded-field border-line bg-base-100"
 >
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
 <input value={activityForm.instructions} onChange={(e) => { const v = e.currentTarget.value; setActivityForm((f) => ({ ...f, instructions: v })) }} placeholder="What should students do?" className="input input w-full rounded-field border-line bg-base-100" />
 </label>

 <div className="rounded-box border border-line bg-base-200 p-3">
 <p className="text-xs font-semibold">Question details</p>
 {activityQ.kind === 'MCQ' ? (
 <div className="mt-2 space-y-2">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Question</span>
 <input value={activityQ.question} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, question: v })); }} placeholder="e.g. What is 'hello' in German?" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <div className="grid gap-2 sm:grid-cols-2">
 {activityQ.options.map((opt, idx) => (
 <label key={idx} className="block">
 <span className="mb-1 block text-[11px] font-medium">Option {idx + 1}</span>
 <input value={opt} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, options: (prev as Extract<ActivityQuestion, { kind: 'MCQ' }>).options.map((o: string, i: number) => (i === idx ? v : o)) } as ActivityQuestion)); }} placeholder={`Option ${idx + 1}`} className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 ))}
 </div>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Correct option (1-4)</span>
 <select value={String(activityQ.correctIndex + 1)} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, correctIndex: Math.max(0, Number(v) - 1) })); }} className="select select w-full rounded-field border-line bg-base-100">
 <option value="1">1</option>
 <option value="2">2</option>
 <option value="3">3</option>
 <option value="4">4</option>
 </select>
 </label>
 </div>
 ) : activityQ.kind === 'FILL_BLANK' ? (
 <div className="mt-2 space-y-2">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Sentence (use ___ for blank)</span>
 <input value={activityQ.sentence} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, sentence: v })); }} placeholder="e.g. Ich ___ Deutsch." className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Correct answer</span>
 <input value={activityQ.answer} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, answer: v })); }} placeholder="e.g. lerne" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 </div>
 ) : activityQ.kind === 'TRUE_FALSE' ? (
 <div className="mt-2 space-y-2">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Statement</span>
 <input value={activityQ.statement} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, statement: v })); }} placeholder="e.g. Berlin is the capital of Germany." className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Correct answer</span>
 <select value={activityQ.correct ? 'true' : 'false'} onChange={(e) => { const v = e.currentTarget.value === 'true'; setActivityQ((prev) => ({ ...prev, correct: v })); }} className="select select w-full rounded-field border-line bg-base-100">
 <option value="true">True</option>
 <option value="false">False</option>
 </select>
 </label>
 </div>
 ) : activityQ.kind === 'WRITING' ? (
 <div className="mt-2 space-y-2">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Writing prompt</span>
 <textarea value={activityQ.prompt} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, prompt: v })); }} placeholder="e.g. Write 100 words about your family..." rows={2} className="textarea w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Minimum words (optional)</span>
 <input value={activityQ.minWords} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, minWords: v })); }} placeholder="e.g. 100" inputMode="numeric" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 </div>
 ) : (
 <div className="mt-2 space-y-2">
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Document prompt</span>
 <textarea value={activityQ.prompt} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, prompt: v })); }} placeholder="e.g. Upload your handwritten letter..." rows={2} className="textarea w-full rounded-field border-line bg-base-100" />
 </label>
 <label className="block">
 <span className="mb-1 block text-[11px] font-medium">Allowed file types</span>
 <input value={activityQ.allowedTypes} onChange={(e) => { const v = e.currentTarget.value; setActivityQ((prev) => ({ ...prev, allowedTypes: v })); }} placeholder="e.g. pdf,docx,jpg" className="input input w-full rounded-field border-line bg-base-100" />
 </label>
 </div>
 )}
 </div>
 <div className="mt-4 flex justify-end gap-2">
 <button type="button" onClick={() => setShowAddActivity(false)} className="btn btn-sm rounded-full border-line bg-base-100">
 Cancel
 </button>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />} Add activity
  </button>
 </div>
 </form>
 </div>);
}
