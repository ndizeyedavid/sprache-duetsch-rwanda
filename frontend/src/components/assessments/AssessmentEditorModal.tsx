import type { FormEvent } from 'react';
import { useEffect,useState } from 'react';
import { FiAlertCircle,FiCheck,FiX } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { createAssessment,getAssessment,updateAssessment } from '../../lib/services';
import { questionError } from '../questions/validate';
import { QuestionBuilder } from '../questions/QuestionBuilder';
import type { AuthoredQuestion } from '../questions/types';
import { ASSESSMENT_TYPES } from './constants';

type Level = { id: string; code: string; title: string };
type Props = { open: boolean; onClose: () => void; levels: Level[]; initialLevelId: string; editing?: { id: string } | null; onSaved: () => void };

export function AssessmentEditorModal({ open, onClose, levels, initialLevelId, editing, onSaved }: Props) {
 const isEditing = Boolean(editing?.id);
 const [levelId, setLevelId] = useState(initialLevelId);
 const [title, setTitle] = useState('');
 const [type, setType] = useState('QUIZ');
 const [passMark, setPassMark] = useState('50');
 const [duration, setDuration] = useState('30');
 const [maxAttempts, setMaxAttempts] = useState('1');
 const [protectedMode, setProtectedMode] = useState(false);
 const [availableFrom, setAvailableFrom] = useState(''), [availableUntil, setAvailableUntil] = useState('');
 const localDate = (v: string | null) => v ? new Date(new Date(v).getTime() - new Date(v).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
 const [isPublished, setIsPublished] = useState(true);
 const [description, setDescription] = useState('');
 const [questions, setQuestions] = useState<AuthoredQuestion[]>([]);
 const [saving, setSaving] = useState(false);
 const [loadingEdit, setLoadingEdit] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [fieldError, setFieldError] = useState<string | null>(null);

 useEffect(() => {
 if (!open) return;
 setError(null); setFieldError(null);
 if (editing?.id) {
 setLoadingEdit(true);
 getAssessment(editing.id).then((a) => {
 setLevelId(a.levelId); setTitle(a.title); setType(a.type);
 setPassMark(String(a.passMark ?? 50));
 setDuration(a.durationMinutes != null ? String(a.durationMinutes) : '30');
 setMaxAttempts(a.maxAttempts != null ? String(a.maxAttempts) : '1');
 setProtectedMode(a.protectedMode); setAvailableFrom(localDate(a.availableFrom)); setAvailableUntil(localDate(a.availableUntil));
 setIsPublished(a.isPublished); setDescription(a.description ?? '');
 setQuestions((a.questions ?? []).flatMap(row => row.question ? [{ ...row.question, points: Number(row.points ?? row.question.points), options: row.question.options ?? null, correctAnswer: row.question.correctAnswer ?? null, audioUrl: row.question.audioUrl ?? null, imageUrl: row.question.imageUrl ?? null }] : []));
 }).catch((err) => setError(apiErrorMessage(err, 'Could not load assessment.'))).finally(() => setLoadingEdit(false));
 } else {
 setLevelId(initialLevelId); setTitle(''); setType('QUIZ'); setPassMark('50');
 setProtectedMode(false); setAvailableFrom(''); setAvailableUntil('');
 setDuration('30'); setMaxAttempts('1'); setIsPublished(true); setDescription(''); setQuestions([]);
 }
 }, [open, editing?.id, initialLevelId]);

 if (!open) return null;

 async function handleSubmit(e: FormEvent) {
 e.preventDefault();
 const issue = questionError(questions); if (issue) { setFieldError(issue); return; }
 if (availableFrom && availableUntil && availableFrom >= availableUntil) { setFieldError('Closing time must be after opening time.'); return; }
 if (!questions.length) { setFieldError('Write at least one question.'); return; }
 if (!title.trim()) { setFieldError('Please enter a title.'); return; }
 setFieldError(null); setError(null); setSaving(true);
 try {
 const settings = { protectedMode, availableFrom: availableFrom ? new Date(availableFrom).toISOString() : null, availableUntil: availableUntil ? new Date(availableUntil).toISOString() : null };

 if (editing?.id) {
 await updateAssessment(editing.id, { authoredQuestions: questions, ...settings, levelId, title: title.trim(), type, passMark: Number(passMark), durationMinutes: duration ? Number(duration) : null, maxAttempts: Number(maxAttempts) || 1, isPublished, description: description.trim() || null });

 } else {
 await createAssessment({ ...settings, levelId, title: title.trim(), type, passMark: Number(passMark), durationMinutes: duration ? Number(duration) : undefined, maxAttempts: maxAttempts ? Number(maxAttempts) : undefined, isPublished, description: description.trim() || undefined, authoredQuestions: questions });
 }
 onSaved(); onClose();
 } catch (err) { setError(apiErrorMessage(err, 'Could not save assessment.')); } finally { setSaving(false); }
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 <form onSubmit={handleSubmit} className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-box bg-base-100">
 <div className="border-b border-line p-5 pr-12"><h3 className="text-sm font-bold">{isEditing ? 'Edit assessment' : 'New assessment'}</h3><p className="mt-1 text-xs text-muted">Quiz or exam — students see it when published.</p><button type="button" onClick={onClose} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3"><FiX aria-hidden /></button></div>
 <div className="flex-1 overflow-y-auto p-5">
 {loadingEdit ? <p className="flex items-center gap-2 py-10 text-sm text-muted"><span className="loading loading-spinner loading-sm" />Loading assessment…</p> : (
 <div className="space-y-3">
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Level *</span><select required value={levelId} onChange={(e) => { setLevelId(e.currentTarget.value); }} className="select w-full rounded-field border-line bg-base-200">{levels.map((l) => <option key={l.id} value={l.id}>{l.code} · {l.title}</option>)}</select></label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Title *</span><input required value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="e.g. A1 Unit 1 Quiz" className="input w-full rounded-field border-line bg-base-200" /></label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Description</span><textarea value={description} onChange={(e) => setDescription(e.currentTarget.value)} rows={2} placeholder="Instructions students see before starting…" className="textarea w-full rounded-field border-line bg-base-100" /></label>
 <div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-xs font-medium">Type</span><select value={type} onChange={(e) => setType(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">{ASSESSMENT_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-xs font-medium">Pass mark (%)</span><input value={passMark} onChange={(e) => setPassMark(e.currentTarget.value)} inputMode="numeric" className="input w-full rounded-field border-line bg-base-200" /></label></div>
 <div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-xs font-medium">Duration (minutes)</span><input value={duration} onChange={(e) => setDuration(e.currentTarget.value)} inputMode="numeric" className="input w-full rounded-field border-line bg-base-200" /></label><label className="block"><span className="mb-1.5 block text-xs font-medium">Max attempts</span><input value={maxAttempts} onChange={(e) => setMaxAttempts(e.currentTarget.value)} inputMode="numeric" className="input w-full rounded-field border-line bg-base-200" /></label></div>
 <div className="grid gap-3 sm:grid-cols-2">{[{ label: "Available from", value: availableFrom, change: setAvailableFrom }, { label: "Closes at", value: availableUntil, change: setAvailableUntil }].map(({ label, value, change }) => <label key={label}><span className="mb-1.5 block text-xs font-medium">{label} · local time</span><input type="datetime-local" value={value} onChange={e => change(e.target.value)} className="input w-full" /></label>)}</div>
 <label className="flex items-center gap-2 text-xs font-medium"><input type="checkbox" className="checkbox checkbox-sm" checked={protectedMode} onChange={e => setProtectedMode(e.target.checked)} />Protected exam mode (fullscreen and violation checks)</label>
 <label className="flex items-center gap-2 text-xs font-medium"><input type="checkbox" className="checkbox checkbox-sm" checked={isPublished} onChange={(e) => setIsPublished(e.currentTarget.checked)} />Publish immediately</label>
 <QuestionBuilder value={questions} onChange={setQuestions} locked={saving} />
 {fieldError ? <p role="alert" className="flex gap-2 rounded-field bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"><FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />{fieldError}</p> : null}
 {error ? <p role="alert" className="flex gap-2 rounded-field bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"><FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />{error}</p> : null}
 </div>
 )}
 </div>
 <div className="flex justify-end gap-2 border-t border-line bg-base-200/30 p-4"><button type="button" onClick={onClose} className="btn btn-sm rounded-full border-line bg-base-100">Cancel</button><button type="submit" disabled={saving || loadingEdit} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">{saving ? <span className="loading loading-spinner loading-xs" /> : <><FiCheck aria-hidden />{isEditing ? 'Save changes' : 'Create assessment'}</>}</button></div>
 </form>
 </div>
 );
}
