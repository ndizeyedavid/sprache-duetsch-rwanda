import { useState } from 'react';
import { reviewHomework } from '../../../lib/homework';
import { apiErrorMessage } from '../../../lib/api';
import type { Homework, Submission, Attachment } from '../homework/types';
import { AttachmentList } from '../homework/AttachmentList';
import { SubmissionHistory } from '../homework/SubmissionHistory';
import { dateLabel, statusLabels } from '../homework/format';
export function ReviewSubmission({ assignment: a, submission: s, files, onSaved }: { assignment: Homework; submission: Submission; files: Attachment[]; onSaved: () => void }) {
  const [feedback, setFeedback] = useState(s.feedback ?? ''), [score, setScore] = useState(s.score ?? ''), [rubric, setRubric] = useState<string[]>(a.rubric.map((_, i) => String(s.rubricScores?.[i] ?? '')));
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const total = a.rubric.length ? rubric.reduce((sum, v) => sum + Number(v || 0), 0) : Number(score);
  async function review(action: 'GRADE' | 'RETURN') {
    setError('');
    if (!feedback.trim()) { setError('Add useful feedback before sending.'); return; }
    if (action === 'GRADE' && (a.rubric.length ? rubric.some(v => v === '') : score === '')) { setError('Enter a score before grading.'); return; }
    setBusy(true);
    try { await reviewHomework(a.id, s.id, { action, score: total, feedback, rubricScores: rubric.map(Number) }); onSaved(); }
    catch (e) { setError(apiErrorMessage(e, 'Could not save feedback.')); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4"><section className="card border border-base-300/70 bg-base-100 p-5 sm:p-7"><div className="mb-5 flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-semibold">{s.student?.user.firstName} {s.student?.user.lastName}</h2><p className="mt-1 text-xs text-base-content/55">{statusLabels[s.status]} · Submission {s.revision} · {dateLabel(s.submittedAt, true)}</p></div><span className="badge badge-ghost">{s.student?.studentCode}</span></div><p className="whitespace-pre-wrap text-sm leading-8">{s.text || 'Response attached below.'}</p><div className="mt-5"><AttachmentList assignmentId={a.id} files={files.filter(f => s.fileIds.includes(f.id))} /></div></section>
    {s.status === 'SUBMITTED' ? <section className="card space-y-4 border border-base-300/70 bg-base-100 p-5 sm:p-7"><h2 className="font-semibold">Give feedback that helps</h2>{a.rubric.length ? a.rubric.map((r, i) => <label key={i} className="flex items-center justify-between gap-4 rounded-field bg-base-200/50 p-3"><span><span className="block text-xs font-semibold">{r.title}</span><span className="mt-1 block text-xs text-base-content/60">{r.description}</span></span><span className="flex shrink-0 items-center gap-2 text-xs"><input type="number" aria-label={`${r.title} score`} className="input input-sm w-20" min={0} max={r.points} step="0.01" value={rubric[i]} onChange={e => setRubric(p => p.map((v, n) => n === i ? e.target.value : v))} />/ {r.points}</span></label>) : <label className="block"><span className="mb-2 block text-xs font-semibold">Score / {a.maxPoints}</span><input type="number" aria-label="Submission score" className="input w-32" min={0} max={Number(a.maxPoints)} step="0.01" value={score} onChange={e => setScore(e.target.value)} /></label>}{a.rubric.length ? <p className="text-right text-sm font-semibold">Total: {total}/{a.maxPoints}</p> : null}<label><span className="mb-2 block text-xs font-semibold">Teacher feedback *</span><textarea className="textarea w-full text-sm leading-7" rows={5} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="What worked well? What should the student practise next?" /></label>{error ? <p role="alert" className="alert alert-error alert-soft text-xs">{error}</p> : null}<div className="flex flex-wrap justify-between gap-3"><button className="btn btn-sm rounded-full" disabled={busy || s.revision >= a.maxSubmissions} onClick={() => void review('RETURN')}>Request revision</button><button className="btn btn-primary btn-sm rounded-full" disabled={busy} onClick={() => void review('GRADE')}>{busy ? 'Saving…' : 'Send grade & feedback'}</button></div>{s.revision >= a.maxSubmissions ? <p className="text-xs text-base-content/60">Increase the submission limit in assignment settings before requesting another revision.</p> : null}</section> : s.feedback ? <section className="card border border-base-300/70 bg-success/5 p-5"><h3 className="text-sm font-semibold">Feedback sent{s.score !== null ? ` · ${s.score}/${a.maxPoints}` : ''}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{s.feedback}</p></section> : null}
    <SubmissionHistory submission={s} files={files} assignmentId={a.id} />
  </div>;
}
