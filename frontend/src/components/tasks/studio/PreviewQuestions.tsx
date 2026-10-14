import { useState } from 'react';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { AssessmentQuestion } from '../../assignments/AssessmentQuestion';
import type { AuthoredQuestion } from '../../questions/types';
import type { PreviewResult } from './preview-grade';
import { previewResult } from './preview-grade';

const badge: Record<PreviewResult, [string, string]> = {
  correct: ['Correct', 'badge-success'], wrong: ['Wrong', 'badge-error'], blank: ['No answer', 'badge-ghost'], manual: ['You mark this', 'badge-info'],
};

/** Questions exactly as students get them. Teachers can answer and check their own answer key. */
export function PreviewQuestions({ questions }: { questions: AuthoredQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [checked, setChecked] = useState(false);
  const results = questions.map(q => previewResult(q, answers[q.id]));
  const auto = questions.filter((_, i) => results[i] !== 'manual');
  const earned = questions.reduce((t, q, i) => t + (results[i] === 'correct' ? Number(q.points) : 0), 0);
  const possible = auto.reduce((t, q) => t + Number(q.points), 0);
  if (!questions.length) return <p className="rounded-box border border-dashed border-base-300 p-6 text-center text-sm text-muted">Questions appear here as you add them.</p>;
  return (
    <div className="space-y-3">
      {questions.map((q, index) => (
        <div key={q.id} className="relative">
          <AssessmentQuestion index={index} value={answers[q.id]} disabled={false}
            onChange={value => { setAnswers(a => ({ ...a, [q.id]: value })); setChecked(false); }}
            item={{ id: q.id, order: index, points: String(q.points), question: { ...q, points: String(q.points) } }} />
          {checked ? <span className={`badge badge-sm badge-soft absolute right-3 top-3 ${badge[results[index]][1]}`}>{badge[results[index]][0]}</span> : null}
        </div>
      ))}
      <div className="sticky bottom-0 flex flex-wrap items-center gap-2 rounded-box border border-base-300 bg-base-100 p-3 ">
        {checked ? <p className="flex-1 text-sm"><strong className="tabular-nums">{earned}/{possible}</strong> points from automatic marking{possible < questions.reduce((t, q) => t + Number(q.points), 0) ? ', plus written answers you mark' : ''}.</p>
          : <p className="flex-1 text-xs text-muted">Answer like a student, then check your answer key.</p>}
        <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={() => { setAnswers({}); setChecked(false); }}><FiRotateCcw aria-hidden />Reset</button>
        <button type="button" disabled={!auto.length} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content" onClick={() => setChecked(true)}><FiCheckCircle aria-hidden />Check answers</button>
      </div>
    </div>
  );
}
