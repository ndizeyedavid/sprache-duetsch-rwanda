import { useEffect,useState } from 'react';
import { apiErrorMessage } from '../../../lib/api';
import { reviewHomework } from '../../../lib/homework';
import { AttachmentList } from '../homework/AttachmentList';
import { SubmissionHistory } from '../homework/SubmissionHistory';
import { dateLabel,statusLabels } from '../homework/format';
import type { Attachment,Homework,Submission } from '../homework/types';
import { QuestionScoring } from './QuestionScoring';

type Props = { assignment: Homework; submission: Submission; files: Attachment[]; onSaved: (next: boolean) => void; hasNext?: boolean; onWorking?: (dirty: boolean, busy: boolean) => void };
export function ReviewSubmission({ assignment: a, submission: s, files, onSaved, hasNext, onWorking }: Props) {
  const questions = a.questions ?? [];
  const [feedback, setFeedback] = useState(s.feedback ?? ''), [score, setScore] = useState(s.score ?? ''), [rubric, setRubric] = useState<string[]>(a.rubric.map((_, i) => s.rubricScores?.[i] == null ? '' : String(s.rubricScores[i])));
  const [questionScores, setQuestionScores] = useState<string[]>(questions.map((_, i) => s.questionScores?.[i] == null ? '' : String(s.questionScores[i])));
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  useEffect(() => { onWorking?.(dirty, busy); }, [dirty, busy, onWorking]);
  const total = questions.length ? questionScores.reduce((sum, v) => sum + Number(v || 0), 0) : a.rubric.length ? rubric.reduce((sum, v) => sum + Number(v || 0), 0) : Number(score);
  async function review(action: 'GRADE' | 'RETURN', next = false) {
    setError('');
    if (!feedback.trim()) { setError('Add useful feedback before sending.'); return; }
    if (action === 'GRADE') {
      const values = questions.length ? questionScores : a.rubric.length ? rubric : [score];
      const limits = questions.length ? questions.map(q => Number(q.points ?? q.question.points)) : a.rubric.length ? a.rubric.map(r => r.points) : [Number(a.maxPoints)];
      if (values.some((v, i) => v === '' || !Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > limits[i])) { setError('Score every answer within its point limit before grading.'); return; }
    }
    setBusy(true);
    try { await reviewHomework(a.id, s.id, { action, score: total, feedback, rubricScores: rubric.map(Number), questionScores: questionScores.map(v => Number(v || 0)) }); setDirty(false); onSaved(next); }
    catch (e) { setError(apiErrorMessage(e, 'Could not save feedback.')); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4">
    <section className="card border border-base-300/70 bg-base-100 p-5 sm:p-7"><div className="mb-5 flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-semibold">{s.student?.user.firstName} {s.student?.user.lastName}</h2><p className="mt-1 text-xs text-base-content/55">{statusLabels[s.status]} · Submission {s.revision} · {dateLabel(s.submittedAt, true)}</p></div><div className="flex gap-2"><span className="badge badge-ghost">{s.student?.studentCode}</span>{s.versions?.[0]?.isLate ? <span className="badge badge-warning badge-soft">Late</span> : null}</div></div>
      {!questions.length ? <><p className="whitespace-pre-wrap text-sm leading-8">{s.text || 'Response attached below.'}</p><div className="mt-5"><AttachmentList assignmentId={a.id} files={files.filter(f => s.fileIds.includes(f.id))} /></div></> : <QuestionScoring questions={questions} responses={s.responses ?? {}} values={questionScores} editable={s.status === 'SUBMITTED' && !busy} onChange={(index, value) => { setDirty(true); setQuestionScores(p => p.map((v, i) => i === index ? value : v)); }} />}
    </section>
    {s.status === 'SUBMITTED' ? <section className="card space-y-4 border border-base-300/70 bg-base-100 p-5 sm:p-7"><h2 className="font-semibold">Grade & feedback</h2>
      {questions.length ? <p className="text-sm font-semibold">Total: {total}/{a.maxPoints} · {questionScores.filter(v => v === '').length} answers still need a score</p> : a.rubric.length ? a.rubric.map((r, i) => <label key={i} className="flex flex-wrap items-center justify-between gap-4 rounded-field bg-base-200/50 p-3"><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{r.title}</span><span className="mt-1 block text-xs text-base-content/60">{r.description}</span></span><span className="flex shrink-0 items-center gap-2 text-xs"><input type="number" aria-label={`${r.title} score`} className="input input-sm w-20" disabled={busy} min={0} max={r.points} step="0.01" value={rubric[i]} onChange={e => { setDirty(true); setRubric(p => p.map((v, n) => n === i ? e.target.value : v)); }} />/ {r.points}</span></label>) : <label className="block"><span className="mb-2 block text-xs font-semibold">Score / {a.maxPoints}</span><input type="number" aria-label="Submission score" className="input w-32" disabled={busy} min={0} max={Number(a.maxPoints)} step="0.01" value={score} onChange={e => { setDirty(true); setScore(e.target.value); }} /></label>}
      {!questions.length && a.rubric.length ? <p className="text-right text-sm font-semibold">Total: {total}/{a.maxPoints}</p> : null}
      <label><span className="mb-2 block text-xs font-semibold">Teacher feedback *</span><textarea className="textarea w-full text-sm leading-7" disabled={busy} rows={5} value={feedback} onChange={e => { setDirty(true); setFeedback(e.target.value); }} placeholder="What worked well? What should the student practise next?" /></label>
      {error ? <p role="alert" className="alert alert-error alert-soft text-xs">{error}</p> : null}
      <div className="flex flex-wrap gap-3"><button className="btn btn-sm rounded-full" disabled={busy || s.revision >= a.maxSubmissions} onClick={() => void review('RETURN', !!hasNext)}>Request revision</button><button className="btn btn-sm rounded-full sm:ml-auto" disabled={busy} onClick={() => void review('GRADE')}>Send grade</button>{hasNext ? <button className="btn btn-primary btn-sm rounded-full" disabled={busy} onClick={() => void review('GRADE', true)}>{busy ? 'Saving…' : 'Send grade & next'}</button> : null}</div>
      {s.revision >= a.maxSubmissions ? <p className="text-xs text-base-content/60">Increase the submission limit in assignment settings before requesting another revision.</p> : null}
    </section> : s.feedback ? <section className="card border border-base-300/70 bg-success/5 p-5"><h3 className="text-sm font-semibold">Feedback sent{s.score !== null ? ` · ${s.score}/${a.maxPoints}` : ''}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{s.feedback}</p></section> : null}
    <SubmissionHistory questions={questions} submission={s} files={files} assignmentId={a.id} />
  </div>;
}
