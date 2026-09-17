import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { FiAlertCircle, FiCheck, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { createAssessment, getAssessment, listQuestions, setAssessmentQuestions, updateAssessment } from '../../lib/services';
import { humanize } from '../../lib/services';
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
 const [isPublished, setIsPublished] = useState(true);
 const [description, setDescription] = useState('');
 const [selected, setSelected] = useState<Record<string, boolean>>({});
 const [qSearch, setQSearch] = useState('');
 const [saving, setSaving] = useState(false);
 const [loadingEdit, setLoadingEdit] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [fieldError, setFieldError] = useState<string | null>(null);
 const [questions, setQuestions] = useState<Awaited<ReturnType<typeof listQuestions>>>([]);

 useEffect(() => {
 if (!open) return;
 setError(null); setFieldError(null); setQSearch('');
 void listQuestions().then(setQuestions).catch(() => setQuestions([]));
 if (editing?.id) {
 setLoadingEdit(true);
 getAssessment(editing.id).then((a) => {
 setLevelId(a.levelId); setTitle(a.title); setType(a.type);
 setPassMark(String(a.passMark ?? 50));
 setDuration(a.durationMinutes != null ? String(a.durationMinutes) : '30');
 setMaxAttempts(a.maxAttempts != null ? String(a.maxAttempts) : '1');
 setIsPublished(a.isPublished); setDescription(a.description ?? '');
 const map: Record<string, boolean> = {};
 (a.questions ?? []).forEach((q) => { map[q.questionId] = true; });
 setSelected(map);
 }).catch((err) => setError(apiErrorMessage(err, 'Could not load assessment.'))).finally(() => setLoadingEdit(false));
 } else {
 setLevelId(initialLevelId); setTitle(''); setType('QUIZ'); setPassMark('50');
 setDuration('30'); setMaxAttempts('1'); setIsPublished(true); setDescription(''); setSelected({});
 }
 }, [open, editing?.id, initialLevelId]);

 const levelQuestions = useMemo(() => {
 let list = questions.filter((q) => q.levelId === levelId);
 if (qSearch.trim()) { const q = qSearch.trim().toLowerCase(); list = list.filter((r) => r.prompt.toLowerCase().includes(q)); }
 return list;
 }, [questions, levelId, qSearch]);

 if (!open) return null;

 async function handleSubmit(e: FormEvent) {
 e.preventDefault();
 if (!title.trim()) { setFieldError('Please enter a title.'); return; }
 setFieldError(null); setError(null); setSaving(true);
 try {
 const chosen = levelQuestions.filter((q) => selected[q.id]).map((q, i) => ({ questionId: q.id, order: i }));
 if (editing?.id) {
 await updateAssessment(editing.id, { levelId, title: title.trim(), type, passMark: Number(passMark) || 50, durationMinutes: duration ? Number(duration) : null, maxAttempts: maxAttempts ? Number(maxAttempts) : null, isPublished, description: description.trim() || null });
 // always sync questions so removals are persisted; keeping empty is intentional (clears)
 await setAssessmentQuestions(editing.id, chosen);
 } else {
 await createAssessment({ levelId, title: title.trim(), type, passMark: Number(passMark) || 50, durationMinutes: duration ? Number(duration) : undefined, maxAttempts: maxAttempts ? Number(maxAttempts) : undefined, isPublished, description: description.trim() || undefined, questions: chosen });
 }
 onSaved(); onClose();
 } catch (err) { setError(apiErrorMessage(err, 'Could not save assessment.')); } finally { setSaving(false); }
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 <form onSubmit={handleSubmit} className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-box bg-base-100">
 <div className="border-b border-line p-5 pr-12"><h3 className="text-sm font-bold">{isEditing ? 'Edit assessment' : 'New assessment'}</h3><p className="mt-1 text-xs text-muted">Canvas assignment — students see it when published.</p><button type="button" onClick={onClose} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3"><FiX aria-hidden /></button></div>
 <div className="flex-1 overflow-y-auto p-5">
 {loadingEdit ? <p className="flex items-center gap-2 py-10 text-sm text-muted"><span className="loading loading-spinner loading-sm" />Loading assessment…</p> : (
 <div className="space-y-3">
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Level *</span><select required value={levelId} onChange={(e) => { setLevelId(e.currentTarget.value); }} className="select w-full rounded-field border-line bg-base-200">{levels.map((l) => <option key={l.id} value={l.id}>{l.code} · {l.title}</option>)}</select></label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Title *</span><input required value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="e.g. A1 Unit 1 Quiz" className="input w-full rounded-field border-line bg-base-200" /></label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Description</span><textarea value={description} onChange={(e) => setDescription(e.currentTarget.value)} rows={2} placeholder="Instructions students see before starting…" className="textarea w-full rounded-field border-line bg-base-100" /></label>
 <div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-xs font-medium">Type</span><select value={type} onChange={(e) => setType(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">{ASSESSMENT_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-xs font-medium">Pass mark (%)</span><input value={passMark} onChange={(e) => setPassMark(e.currentTarget.value)} inputMode="numeric" className="input w-full rounded-field border-line bg-base-200" /></label></div>
 <div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-xs font-medium">Duration (minutes)</span><input value={duration} onChange={(e) => setDuration(e.currentTarget.value)} inputMode="numeric" className="input w-full rounded-field border-line bg-base-200" /></label><label className="block"><span className="mb-1.5 block text-xs font-medium">Max attempts</span><input value={maxAttempts} onChange={(e) => setMaxAttempts(e.currentTarget.value)} inputMode="numeric" className="input w-full rounded-field border-line bg-base-200" /></label></div>
 <label className="flex items-center gap-2 text-xs font-medium"><input type="checkbox" className="checkbox checkbox-sm" checked={isPublished} onChange={(e) => setIsPublished(e.currentTarget.checked)} />Publish immediately</label>
 <div className="rounded-box border border-line bg-base-200/40 p-3">
 <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold">Questions ({levelQuestions.filter((q) => selected[q.id]).length} selected)</p><span className="text-[11px] text-muted">{levelQuestions.length} for this level</span></div>
 <div className="relative mt-2"><FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={qSearch} onChange={(e) => setQSearch(e.currentTarget.value)} placeholder="Filter questions…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9" /></div>
 {levelQuestions.length === 0 ? <p className="mt-2 text-[11px] text-muted">No questions for this level — add some in Question bank first.</p> : (
 <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-box bg-base-100 p-2">{levelQuestions.map((q) => (<li key={q.id} className="flex items-start gap-2 rounded-field px-2 py-1.5 hover:bg-base-200"><input type="checkbox" className="checkbox checkbox-xs mt-0.5" checked={Boolean(selected[q.id])} onChange={() => setSelected((p) => ({ ...p, [q.id]: !p[q.id] }))} /><div className="min-w-0 grow"><p className="line-clamp-2 text-[11px] leading-snug">{q.prompt}</p><p className="text-[11px] text-muted">{humanize(q.type)} · {humanize(q.skill)} · {humanize(q.difficulty)}</p></div></li>))}</ul>
 )}
 {Object.keys(selected).some((k) => selected[k]) ? <button type="button" onClick={() => setSelected({})} className="btn btn-ghost btn-xs mt-2 gap-1"><FiTrash2 aria-hidden />Clear selection</button> : null}
 </div>
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
