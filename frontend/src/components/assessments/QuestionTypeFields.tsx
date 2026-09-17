import { FiCheck, FiMusic, FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import type { FriendlyType } from './constants';

type Props = {
 type: FriendlyType;
 prompt: string;
 fillAnswer: string;
 onFillAnswer: (v: string) => void;
 choiceOptions: string[];
 onChoiceOptions: (v: string[]) => void;
 choiceCorrect: Set<number>;
 onChoiceCorrect: (v: Set<number>) => void;
 allowMultiple: boolean;
 onAllowMultiple: (v: boolean) => void;
 trueFalseCorrect: boolean;
 onTrueFalseCorrect: (v: boolean) => void;
 writingSample: string;
 onWritingSample: (v: string) => void;
 writingMinWords: string;
 onWritingMinWords: (v: string) => void;
 orderingItems: string[];
 onOrderingItems: (v: string[]) => void;
 audioUrl: string;
 onAudioUrl: (v: string) => void;
 audioUploading: boolean;
 onAudioUploading: (v: boolean) => void;
 onAudioUploaded: (url: string) => void;
};

export function QuestionTypeFields({
 type,
 prompt,
 fillAnswer,
 onFillAnswer,
 choiceOptions,
 onChoiceOptions,
 choiceCorrect,
 onChoiceCorrect,
 allowMultiple,
 onAllowMultiple,
 trueFalseCorrect,
 onTrueFalseCorrect,
 writingSample,
 onWritingSample,
 writingMinWords,
 onWritingMinWords,
 orderingItems,
 onOrderingItems,
 audioUrl,
 onAudioUrl,
 audioUploading,
 onAudioUploading,
 onAudioUploaded,
}: Props) {
 if (type === 'FILL_BLANK') {
 return (
 <div className="space-y-3">
 <h4 className="text-xs font-bold">Answer for the blank</h4>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Correct word *</span>
 <input value={fillAnswer} onChange={(e) => onFillAnswer(e.currentTarget.value)} placeholder="e.g. lerne" className="input w-full rounded-field border-line bg-base-100" />
 </label>
 {prompt.includes('___') && fillAnswer.trim() ? (
 <p className="rounded-field bg-brand-soft px-3 py-2 text-xs">
 Preview: {prompt.split('___')[0]}
 <span className="rounded bg-white px-1.5 py-0.5 font-semibold text-brand">{fillAnswer.trim()}</span>
 {prompt.split('___').slice(1).join(' ___ ')}
 </p>
 ) : null}
 <p className="text-[11px] leading-snug text-muted">Students type this word — extra spaces and capitalisation are ignored when grading.</p>
 </div>
 );
 }

 if (type === 'MULTIPLE_CHOICE') {
 return (
 <div className="space-y-3">
 <div className="flex items-center justify-between gap-2">
 <h4 className="text-xs font-bold">Answer options *</h4>
 <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium">
 <input type="checkbox" className="checkbox checkbox-xs" checked={allowMultiple} onChange={(e) => onAllowMultiple(e.currentTarget.checked)} />
 Allow multiple correct
 </label>
 </div>
 <p className="text-[11px] text-muted">Write each option. Tick the correct one{allowMultiple ? 's' : ''}.</p>
 <div className="space-y-2">
 {choiceOptions.map((opt, idx) => (
 <div key={idx} className="flex items-center gap-2">
 <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-base-100 text-[11px] font-bold text-muted">{String.fromCharCode(65 + idx)}</span>
 <input value={opt} onChange={(e) => onChoiceOptions(choiceOptions.map((o, i) => (i === idx ? e.currentTarget.value : o)))} placeholder={`Option ${idx + 1}`} className="input input-sm flex-1 rounded-field border-line bg-base-100" />
 <label className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition ${choiceCorrect.has(idx) ? 'border-brand bg-brand text-white' : 'border-line bg-base-100 text-muted hover:border-brand/40'}`}>
 <input type={allowMultiple ? 'checkbox' : 'radio'} name="choice-correct" checked={choiceCorrect.has(idx)} onChange={() => { if (allowMultiple) { const n = new Set(choiceCorrect); if (n.has(idx)) n.delete(idx); else n.add(idx); onChoiceCorrect(n); } else onChoiceCorrect(new Set([idx])); }} className="sr-only" />
 <FiCheck aria-hidden className="text-xs" />
 </label>
 <button type="button" disabled={choiceOptions.length <= 2} onClick={() => { onChoiceOptions(choiceOptions.filter((_, i) => i !== idx)); const n = new Set<number>(); choiceCorrect.forEach((p) => { if (p < idx) n.add(p); else if (p > idx) n.add(p - 1); }); if (n.size === 0) n.add(0); onChoiceCorrect(n); }} className="btn btn-ghost btn-xs btn-circle shrink-0 disabled:opacity-30" aria-label="Remove option"><FiTrash2 aria-hidden className="text-xs" /></button>
 </div>
 ))}
 </div>
 <button type="button" disabled={choiceOptions.length >= 6} onClick={() => onChoiceOptions([...choiceOptions, ''])} className="btn btn-xs gap-1 rounded-full border-dashed border-line bg-base-100 disabled:opacity-50"><FiPlus aria-hidden />Add option</button>
 </div>
 );
 }

 if (type === 'LISTENING') {
 return (
 <div className="space-y-4">
 <div>
 <h4 className="flex items-center gap-2 text-xs font-bold"><FiMusic aria-hidden className="text-brand" /> Audio clip *</h4>
 <p className="mt-1 text-[11px] leading-snug text-muted">Students press play, listen, then answer the question below. Upload an mp3 or paste a link.</p>
 {audioUrl ? (
 <div className="mt-3 rounded-box border border-brand/20 bg-brand-soft/40 p-3">
 <audio controls src={audioUrl} className="w-full" preload="metadata" />
 <div className="mt-2 flex items-center gap-2">
 <span className="truncate text-[11px] text-muted">{audioUrl}</span>
 <button type="button" onClick={() => onAudioUrl('')} className="btn btn-ghost btn-xs gap-1 text-coral"><FiX aria-hidden />Remove</button>
 </div>
 </div>
 ) : null}
 <div className="mt-3 flex flex-wrap items-center gap-2">
 <label className="btn btn-sm gap-1 rounded-full border-line bg-base-100">
 <FiUpload aria-hidden />{audioUploading ? <span className="loading loading-spinner loading-xs" /> : 'Upload audio'}
 <input type="file" accept="audio/*" className="hidden" onChange={async (e) => { const f = e.currentTarget.files?.[0]; if (!f) return; onAudioUploading(true); try { const { uploadFile } = await import('../../lib/services'); const r = await uploadFile(f); onAudioUploaded(r.url); } finally { onAudioUploading(false); e.currentTarget.value = ''; } }} />
 </label>
 <span className="text-[11px] text-muted">or</span>
 <input value={audioUrl} onChange={(e) => onAudioUrl(e.currentTarget.value)} placeholder="https://.../audio.mp3" className="input input-sm flex-1 rounded-full border-line bg-base-100" />
 </div>
 </div>
 <div className="border-t border-line pt-4">
 <h4 className="text-xs font-bold">Answer options *</h4>
 <p className="mt-1 text-[11px] text-muted">What question should students answer after listening? Provide 2–4 options and tick the correct one.</p>
 <div className="mt-3 space-y-2">
 {choiceOptions.map((opt, idx) => (
 <div key={idx} className="flex items-center gap-2">
 <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-base-100 text-[11px] font-bold text-muted">{String.fromCharCode(65 + idx)}</span>
 <input value={opt} onChange={(e) => onChoiceOptions(choiceOptions.map((o, i) => (i === idx ? e.currentTarget.value : o)))} placeholder={`Option ${idx + 1}`} className="input input-sm flex-1 rounded-field border-line bg-base-100" />
 <label className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition ${choiceCorrect.has(idx) ? 'border-brand bg-brand text-white' : 'border-line bg-base-100 text-muted hover:border-brand/40'}`}>
 <input type="radio" name="listening-correct" checked={choiceCorrect.has(idx)} onChange={() => onChoiceCorrect(new Set([idx]))} className="sr-only" />
 <FiCheck aria-hidden className="text-xs" />
 </label>
 <button type="button" disabled={choiceOptions.length <= 2} onClick={() => { onChoiceOptions(choiceOptions.filter((_, i) => i !== idx)); const n = new Set<number>(); choiceCorrect.forEach((p) => { if (p < idx) n.add(p); else if (p > idx) n.add(p - 1); }); if (n.size === 0) n.add(0); onChoiceCorrect(n); }} className="btn btn-ghost btn-xs btn-circle shrink-0 disabled:opacity-30" aria-label="Remove"><FiTrash2 aria-hidden className="text-xs" /></button>
 </div>
 ))}
 </div>
 <button type="button" disabled={choiceOptions.length >= 4} onClick={() => onChoiceOptions([...choiceOptions, ''])} className="btn btn-xs mt-2 gap-1 rounded-full border-dashed border-line bg-base-100 disabled:opacity-50"><FiPlus aria-hidden />Add option</button>
 </div>
 </div>
 );
 }

 if (type === 'TRUE_FALSE') {
 return (
 <div className="space-y-3">
 <h4 className="text-xs font-bold">Correct answer *</h4>
 <p className="text-[11px] text-muted">Students see True / False — pick which one is right.</p>
 <div className="grid grid-cols-2 gap-2">
 <button type="button" onClick={() => onTrueFalseCorrect(true)} aria-pressed={trueFalseCorrect} className={`rounded-box border p-4 text-center transition ${trueFalseCorrect ? 'border-brand bg-brand-soft' : 'border-line bg-base-100 hover:bg-base-200/50'}`}>
 <span className={`mx-auto flex size-8 items-center justify-center rounded-full text-xs font-bold ${trueFalseCorrect ? 'bg-brand text-white' : 'bg-base-200 text-muted'}`}>✓</span>
 <span className={`mt-2 block text-sm font-bold ${trueFalseCorrect ? 'text-[#B30A00]' : ''}`}>True</span>
 <span className="text-[11px] text-muted">is correct</span>
 </button>
 <button type="button" onClick={() => onTrueFalseCorrect(false)} aria-pressed={!trueFalseCorrect} className={`rounded-box border p-4 text-center transition ${!trueFalseCorrect ? 'border-brand bg-brand-soft' : 'border-line bg-base-100 hover:bg-base-200/50'}`}>
 <span className={`mx-auto flex size-8 items-center justify-center rounded-full text-xs font-bold ${!trueFalseCorrect ? 'bg-brand text-white' : 'bg-base-200 text-muted'}`}>✕</span>
 <span className={`mt-2 block text-sm font-bold ${!trueFalseCorrect ? 'text-[#B30A00]' : ''}`}>False</span>
 <span className="text-[11px] text-muted">is correct</span>
 </button>
 </div>
 </div>
 );
 }

 if (type === 'WRITING') {
 return (
 <div className="space-y-3">
 <h4 className="text-xs font-bold">Grading guide (optional)</h4>
 <p className="text-[11px] leading-snug text-muted">Writing is graded by a teacher — add what you expect so graders have a reference.</p>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Sample answer / what to look for</span><textarea value={writingSample} onChange={(e) => onWritingSample(e.currentTarget.value)} rows={3} placeholder="e.g. Look for greeting, introduction, 2–3 sentences about family…" className="textarea w-full rounded-field border-line bg-base-100" /></label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Minimum words (empty = no limit)</span><input value={writingMinWords} onChange={(e) => onWritingMinWords(e.currentTarget.value)} inputMode="numeric" placeholder="e.g. 50" className="input w-full rounded-field border-line bg-base-100" /></label>
 </div>
 );
 }

 return (
 <div className="space-y-3">
 <h4 className="text-xs font-bold">Correct order *</h4>
 <p className="text-[11px] leading-snug text-muted">List items in the right order — students see them shuffled.</p>
 <div className="space-y-2">
 {orderingItems.map((item, idx) => (
 <div key={idx} className="flex items-center gap-2">
 <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-base-100 text-[11px] font-bold text-muted">{idx + 1}</span>
 <input value={item} onChange={(e) => onOrderingItems(orderingItems.map((o, i) => (i === idx ? e.currentTarget.value : o)))} placeholder={`Step ${idx + 1}`} className="input input-sm flex-1 rounded-field border-line bg-base-100" />
 <button type="button" disabled={orderingItems.length <= 2} onClick={() => onOrderingItems(orderingItems.filter((_, i) => i !== idx))} className="btn btn-ghost btn-xs btn-circle shrink-0 disabled:opacity-30" aria-label="Remove step"><FiTrash2 aria-hidden className="text-xs" /></button>
 </div>
 ))}
 </div>
 <button type="button" disabled={orderingItems.length >= 8} onClick={() => onOrderingItems([...orderingItems, ''])} className="btn btn-xs gap-1 rounded-full border-dashed border-line bg-base-100 disabled:opacity-50"><FiPlus aria-hidden />Add step</button>
 {orderingItems.filter((o) => o.trim()).length >= 2 ? <p className="rounded-field bg-base-100 px-3 py-2 text-xs"><span className="font-semibold">Preview:</span> {orderingItems.filter((o) => o.trim()).join(' → ')}</p> : null}
 </div>
 );
}
