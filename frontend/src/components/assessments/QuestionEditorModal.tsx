import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { createQuestion, getQuestion, humanize, updateQuestion } from '../../lib/services';
import { DIFFICULTIES, SKILLS, friendlyToBackend, hydrateFriendlyType } from './constants';
import type { FriendlyType } from './constants';
import { QuestionTypeFields } from './QuestionTypeFields';
import { QuestionTypePicker } from './QuestionTypePicker';

type Level = { id: string; code: string; title: string };
type Props = { open: boolean; onClose: () => void; levels: Level[]; initialLevelId: string; editing?: { id: string } | null; onSaved: () => void };
function parseArray(v: unknown): string[] { if (Array.isArray(v)) return v.map(String); if (typeof v === 'string') return [v]; return []; }

export function QuestionEditorModal({ open, onClose, levels, initialLevelId, editing, onSaved }: Props) {
 const isEditing = Boolean(editing?.id);
 const [levelId, setLevelId] = useState(initialLevelId);
 const [friendlyType, setFriendlyType] = useState<FriendlyType>('FILL_BLANK');
 const [skill, setSkill] = useState('VOCABULARY');
 const [difficulty, setDifficulty] = useState('EASY');
 const [prompt, setPrompt] = useState('');
 const [points, setPoints] = useState('1');
 const [explanation, setExplanation] = useState('');
 const [fillAnswer, setFillAnswer] = useState('');
 const [choiceOptions, setChoiceOptions] = useState<string[]>(['', '']);
 const [choiceCorrect, setChoiceCorrect] = useState<Set<number>>(new Set([0]));
 const [allowMultiple, setAllowMultiple] = useState(false);
 const [trueFalseCorrect, setTrueFalseCorrect] = useState(true);
 const [writingSample, setWritingSample] = useState('');
 const [writingMinWords, setWritingMinWords] = useState('');
 const [orderingItems, setOrderingItems] = useState<string[]>(['', '']);
 const [audioUrl, setAudioUrl] = useState('');
 const [audioUploading, setAudioUploading] = useState(false);
 const [saving, setSaving] = useState(false);
 const [loadingEdit, setLoadingEdit] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [fieldError, setFieldError] = useState<string | null>(null);

 useEffect(() => {
 if (!open) return;
 setError(null); setFieldError(null);
 if (editing?.id) {
 setLoadingEdit(true);
 getQuestion(editing.id).then((q) => {
 setLevelId(q.levelId); const ft = hydrateFriendlyType(q as never); setFriendlyType(ft);
 setSkill(q.skill); setDifficulty(q.difficulty); setPrompt(q.prompt);
 setPoints(String(q.points ?? 1)); setExplanation((q.explanation as string) ?? '');
 const opts = parseArray(q.options); const ans = q.correctAnswer;
 if (ft === 'FILL_BLANK') setFillAnswer(typeof ans === 'string' ? ans : String(ans ?? ''));
 else if (ft === 'MULTIPLE_CHOICE' || ft === 'LISTENING') {
 const options = opts.length >= 2 ? opts : ['', '']; setChoiceOptions(options);
 const isMultiple = q.type === 'MULTIPLE_CHOICE'; setAllowMultiple(isMultiple);
 const ansArr = Array.isArray(ans) ? ans.map(String) : ans != null ? [String(ans)] : [];
 const s = new Set<number>(); ansArr.forEach((a) => { const idx = options.findIndex((o) => o.trim().toLowerCase() === a.trim().toLowerCase()); if (idx !== -1) s.add(idx); }); if (s.size === 0 && options[0]) s.add(0); setChoiceCorrect(s);
 if (ft === 'LISTENING') setAudioUrl(q.audioUrl ?? '');
 } else if (ft === 'TRUE_FALSE') { const v = String(ans ?? 'True').toLowerCase(); setTrueFalseCorrect(v === 'true' || v === 'richtig' || v === 'wahr'); }
 else if (ft === 'WRITING') { setWritingSample(typeof ans === 'string' ? ans : ans ? JSON.stringify(ans) : ''); const minW = (q.options as { minWords?: number } | null)?.minWords; setWritingMinWords(minW != null ? String(minW) : ''); }
 else if (ft === 'ORDERING') { const items = opts.length ? opts : parseArray(ans); setOrderingItems(items.length ? items : ['', '']); }
 }).catch((err) => setError(apiErrorMessage(err, 'Could not load question.'))).finally(() => setLoadingEdit(false));
 } else {
 setLevelId(initialLevelId); setFriendlyType('FILL_BLANK'); setSkill('VOCABULARY'); setDifficulty('EASY');
 setPrompt(''); setPoints('1'); setExplanation(''); setFillAnswer(''); setChoiceOptions(['', '']); setChoiceCorrect(new Set([0]));
 setAllowMultiple(false); setTrueFalseCorrect(true); setWritingSample(''); setWritingMinWords(''); setOrderingItems(['', '']); setAudioUrl('');
 }
 }, [open, editing?.id, initialLevelId]);

 const promptLabel = useMemo(() => ({ FILL_BLANK: 'Sentence', TRUE_FALSE: 'Statement', WRITING: 'Writing task', ORDERING: 'Instruction', LISTENING: 'Question about the audio' } as Record<string, string>)[friendlyType] ?? 'Question', [friendlyType]);
 const promptPlaceholder = useMemo(() => ({ FILL_BLANK: 'e.g. Ich ___ aus Ruanda. (use ___ for blank)', MULTIPLE_CHOICE: 'e.g. What is “hello” in German?', TRUE_FALSE: 'e.g. Berlin is capital of Germany.', WRITING: 'e.g. Write 80–100 words about family.', ORDERING: 'e.g. Put words in correct order.', LISTENING: 'e.g. What did you hear? Where is Anna going?' } as Record<string, string>)[friendlyType] ?? '', [friendlyType]);

 function validate(): string | null {
 if (!prompt.trim()) return 'Please enter the question.';
 if (friendlyType === 'FILL_BLANK') { if (!prompt.includes('___')) return 'Use ___ in the sentence to show where the blank is.'; if (!fillAnswer.trim()) return 'Please enter the correct answer for the blank.'; }
 if (friendlyType === 'MULTIPLE_CHOICE') { const f = choiceOptions.map((o) => o.trim()).filter(Boolean); if (f.length < 2) return 'Add at least 2 answer options.'; if (choiceCorrect.size === 0) return 'Mark at least one correct answer.'; for (const i of choiceCorrect) if (!choiceOptions[i]?.trim()) return 'Correct answer cannot be empty.'; }
 if (friendlyType === 'LISTENING') { if (!audioUrl.trim()) return 'Please upload an audio clip or paste a link.'; const f = choiceOptions.map((o) => o.trim()).filter(Boolean); if (f.length < 2) return 'Add at least 2 answer options for the listening question.'; if (choiceCorrect.size === 0) return 'Mark the correct answer.'; }
 if (friendlyType === 'ORDERING') { const f = orderingItems.map((o) => o.trim()).filter(Boolean); if (f.length < 2) return 'Add at least 2 items to order.'; }
 return null;
 }

 async function handleSubmit(e: FormEvent) {
 e.preventDefault(); const v = validate(); if (v) { setFieldError(v); return; }
 setFieldError(null); setError(null); setSaving(true);
 try {
 const backendType = friendlyToBackend(friendlyType, allowMultiple);
 const effectiveSkill = friendlyType === 'LISTENING' ? 'LISTENING' : skill;
 const base: Record<string, unknown> = { levelId, type: backendType, skill: effectiveSkill, difficulty, prompt: prompt.trim(), points: Number(points) || 1, explanation: explanation.trim() || undefined };
 if (friendlyType === 'FILL_BLANK') { base.correctAnswer = fillAnswer.trim(); base.options = null; base.audioUrl = null; }
 else if (friendlyType === 'MULTIPLE_CHOICE') { const opts = choiceOptions.map((o) => o.trim()).filter(Boolean); base.options = opts; const c = [...choiceCorrect].map((i) => choiceOptions[i]?.trim()).filter(Boolean) as string[]; base.correctAnswer = allowMultiple ? c : (c[0] ?? opts[0]); base.audioUrl = null; }
 else if (friendlyType === 'LISTENING') { const opts = choiceOptions.map((o) => o.trim()).filter(Boolean); base.options = opts; const c = [...choiceCorrect].map((i) => choiceOptions[i]?.trim()).filter(Boolean)[0] ?? opts[0]; base.correctAnswer = c; base.audioUrl = audioUrl.trim(); }
 else if (friendlyType === 'TRUE_FALSE') { base.options = ['True', 'False']; base.correctAnswer = trueFalseCorrect ? 'True' : 'False'; base.audioUrl = null; }
 else if (friendlyType === 'WRITING') { base.correctAnswer = writingSample.trim() || null; const min = writingMinWords.trim() ? Number(writingMinWords) : undefined; base.options = min ? { minWords: min } : null; base.audioUrl = null; }
 else { const items = orderingItems.map((o) => o.trim()).filter(Boolean); base.options = items; base.correctAnswer = items; base.audioUrl = null; }
 if (editing?.id) await updateQuestion(editing.id, base); else await createQuestion(base);
 onSaved(); onClose();
 } catch (err) { setError(apiErrorMessage(err, 'Could not save question.')); } finally { setSaving(false); }
 }

 if (!open) return null;
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 <form onSubmit={handleSubmit} className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-box bg-base-100">
 <div className="shrink-0 border-b border-line px-5 py-4 pr-12"><h3 className="text-sm font-bold">{isEditing ? 'Edit question' : 'New question'}</h3><p className="mt-1 text-xs text-muted">No codes or JSON — just fill in the fields.</p><button type="button" onClick={onClose} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3"><FiX aria-hidden /></button></div>
 <div className="flex-1 overflow-y-auto px-5 py-5">
 {loadingEdit ? <p className="flex items-center gap-2 py-10 text-sm text-muted"><span className="loading loading-spinner loading-sm" />Loading…</p> : (
 <div className="space-y-5">
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Level *</span><select value={levelId} onChange={(e) => setLevelId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">{levels.map((l) => <option key={l.id} value={l.id}>{l.code} · {l.title}</option>)}</select></label>
 <QuestionTypePicker value={friendlyType} onChange={setFriendlyType} />
 <div className="grid gap-3 sm:grid-cols-3">
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Skill</span><select value={friendlyType === 'LISTENING' ? 'LISTENING' : skill} onChange={(e) => setSkill(e.currentTarget.value)} disabled={friendlyType === 'LISTENING'} className="select w-full rounded-field border-line bg-base-200 disabled:opacity-60">{SKILLS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{friendlyType === 'LISTENING' ? <span className="mt-1 block text-[11px] text-muted">Listening skill is automatic for audio questions.</span> : null}</label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Difficulty</span><select value={difficulty} onChange={(e) => setDifficulty(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">{DIFFICULTIES.map((o) => <option key={o.value} value={o.value}>{humanize(o.value)}</option>)}</select></label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Points</span><input value={points} onChange={(e) => setPoints(e.currentTarget.value)} inputMode="numeric" className="input w-full rounded-field border-line bg-base-200" /></label>
 </div>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">{promptLabel} *</span><textarea required value={prompt} onChange={(e) => setPrompt(e.currentTarget.value)} rows={friendlyType === 'WRITING' ? 3 : 2} placeholder={promptPlaceholder} className="textarea w-full rounded-field border-line bg-base-100" />{friendlyType === 'FILL_BLANK' ? <span className="mt-1 block text-[11px] text-muted">Tip: type ___ exactly where the blank should be.</span> : null}</label>
 <div className="rounded-box border border-line bg-base-200/40 p-4"><QuestionTypeFields type={friendlyType} prompt={prompt} fillAnswer={fillAnswer} onFillAnswer={setFillAnswer} choiceOptions={choiceOptions} onChoiceOptions={setChoiceOptions} choiceCorrect={choiceCorrect} onChoiceCorrect={setChoiceCorrect} allowMultiple={allowMultiple} onAllowMultiple={setAllowMultiple} trueFalseCorrect={trueFalseCorrect} onTrueFalseCorrect={setTrueFalseCorrect} writingSample={writingSample} onWritingSample={setWritingSample} writingMinWords={writingMinWords} onWritingMinWords={setWritingMinWords} orderingItems={orderingItems} onOrderingItems={setOrderingItems} audioUrl={audioUrl} onAudioUrl={setAudioUrl} audioUploading={audioUploading} onAudioUploading={setAudioUploading} onAudioUploaded={setAudioUrl} /></div>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Explanation (shown after grading)</span><textarea value={explanation} onChange={(e) => setExplanation(e.currentTarget.value)} rows={2} placeholder="e.g. We use 'bin' for ich." className="textarea w-full rounded-field border-line bg-base-100" /><span className="mt-1 block text-[11px] text-muted">Optional.</span></label>
 {fieldError ? <p role="alert" className="flex gap-2 rounded-field bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"><FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />{fieldError}</p> : null}
 {error ? <p role="alert" className="flex gap-2 rounded-field bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"><FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />{error}</p> : null}
 </div>
 )}
 </div>
 <div className="flex shrink-0 justify-end gap-2 border-t border-line bg-base-200/30 px-5 py-4"><button type="button" onClick={onClose} className="btn btn-sm rounded-full border-line bg-base-100">Cancel</button><button type="submit" disabled={saving || loadingEdit || audioUploading} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">{saving ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />}{isEditing ? 'Save changes' : 'Add question'}</button></div>
 </form>
 </div>
 );
}
