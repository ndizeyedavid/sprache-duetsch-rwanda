import { useState } from 'react';
import { FiAlertCircle, FiCheck, FiEye, FiSearch, FiX } from 'react-icons/fi';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { gradeActivitySubmission, listActivitySubmissions } from '../../lib/services';

type Props = { lessonId: string };

export function ActivityGradingPanel({ lessonId }: Props) {
  const submissions = useApi(`activity-subs-${lessonId}`, () => listActivitySubmissions({ lessonId }));
  const [q, setQ] = useState('');
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [score, setScore] = useState('1');
  const [isCorrect, setIsCorrect] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = ((submissions.data ?? []) as unknown as { id: string; activity: { title: string; type: string }; student: { studentCode: string; user: { firstName: string; lastName: string } }; status: string; score: string | number | null; isCorrect: boolean | null; feedback: string | null; response: unknown; attemptNumber: number; submittedAt: string }[]).filter((s) => {
    const x = s as unknown as { activity: { title: string }; student: { studentCode: string; user: { firstName: string; lastName: string } }; status: string };
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    return `${x.activity.title} ${x.student.studentCode} ${x.student.user.firstName} ${x.student.user.lastName} ${x.status}`.toLowerCase().includes(needle);
  });

  async function handleGrade(id: string) {
    setError(null); setSaving(true);
    try {
      await gradeActivitySubmission(id, { score: Number(score), isCorrect, feedback: feedback.trim() || undefined });
      setGradingId(null);
      submissions.refetch();
    } catch (err) { setError(apiErrorMessage(err, 'Could not grade.')); } finally { setSaving(false); }
  }

  return (
    <div className="overflow-hidden rounded-box border border-line bg-base-100">
      <div className="border-b border-line bg-base-200/50 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold"><FiEye aria-hidden className="text-brand" />Student submissions<span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-normal text-muted">{(submissions.data ?? []).length}</span></h3>
        <p className="mt-1 text-xs text-muted">For your facilitator — review, score (0 or 1) and give feedback. Auto-graded activities show Correct/Incorrect.</p>
      </div>
      <div className="p-4">
        <div className="relative">
          <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.currentTarget.value)} placeholder="Search student or activity…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-xs" />
          {q ? <button type="button" onClick={() => setQ('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"><FiX aria-hidden /></button> : null}
        </div>

        {submissions.loading ? <div className="mt-3"><LoadingBlock label="Loading submissions…" /></div> : submissions.error ? <div className="mt-3"><ErrorBlock message={submissions.error} onRetry={submissions.refetch} /></div> : filtered.length === 0 ? <div className="mt-3"><EmptyBlock title="No submissions yet" hint="Students' answers appear here once they submit an activity from this lesson." /></div> : (
          <ul className="mt-3 space-y-2">
            {filtered.map((s) => (
              <li key={s.id} className="rounded-box border border-line bg-base-100 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{s.activity.title} <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-normal">{s.activity.type}</span></p>
                    <p className="mt-0.5 text-xs text-muted">{s.student.user.firstName} {s.student.user.lastName} · {s.student.studentCode} · Attempt #{s.attemptNumber} · {new Date(s.submittedAt).toLocaleString()}</p>
                    <p className="mt-1 max-w-md truncate rounded bg-base-200 px-2 py-1 text-xs">Response: {typeof s.response === 'string' ? s.response : JSON.stringify(s.response)}</p>
                    <p className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${s.status === 'GRADED' ? 'bg-brand text-white' : 'bg-sun text-white'}`}>{s.status}</span>
                      {s.score !== null ? <span className="rounded-full bg-base-200 px-2 py-0.5">Score: {String(s.score)}/1</span> : null}
                      {s.isCorrect !== null ? <span className={`rounded-full px-2 py-0.5 font-medium ${s.isCorrect ? 'bg-brand-soft text-brand' : 'bg-coral-soft text-coral'}`}>{s.isCorrect ? 'Correct' : 'Incorrect'}</span> : null}
                    </p>
                    {s.feedback ? <p className="mt-1 rounded bg-base-200 px-2 py-1 text-xs">Feedback: {s.feedback}</p> : null}
                  </div>
                  <button type="button" onClick={() => { setGradingId(s.id); setScore(String(s.score ?? 1)); setIsCorrect(s.isCorrect ?? true); setFeedback(s.feedback ?? ''); setError(null); }} className="btn btn-xs rounded-full border-line bg-base-100">Grade</button>
                </div>
                {gradingId === s.id ? (
                  <div className="mt-3 rounded-box border border-line bg-base-200/40 p-3">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <label className="block"><span className="mb-1 block text-xs font-medium">Score (0-1)</span><input type="number" min={0} max={1} step={1} value={score} onChange={(e) => setScore(e.currentTarget.value)} className="input input-sm w-full rounded-full border-line bg-base-100" /></label>
                      <label className="flex items-center gap-2 pt-6 text-xs font-medium"><input type="checkbox" className="checkbox checkbox-xs" checked={isCorrect} onChange={(e) => setIsCorrect(e.currentTarget.checked)} />Correct</label>
                      <span className="pt-6 text-xs text-muted">WRITING is manual — set Correct and feedback.</span>
                    </div>
                    <label className="mt-2 block"><span className="mb-1 block text-xs font-medium">Feedback</span><textarea value={feedback} onChange={(e) => setFeedback(e.currentTarget.value)} rows={2} placeholder="Feedback for student…" className="textarea w-full rounded-box border-line bg-base-100 text-sm" /></label>
                    {error ? <p role="alert" className="mt-2 flex gap-2 rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"><FiAlertCircle aria-hidden />{error}</p> : null}
                    <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setGradingId(null)} className="btn btn-xs rounded-full border-line bg-base-100">Cancel</button><button type="button" disabled={saving} onClick={() => void handleGrade(s.id)} className="btn btn-xs gap-1 rounded-full border-0 bg-brand text-white disabled:opacity-60">{saving ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />}Save grade</button></div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
