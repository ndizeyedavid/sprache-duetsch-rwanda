import { FiClock, FiExternalLink, FiFlag, FiRepeat, FiTarget } from 'react-icons/fi';
import { dateLabel, responseLabels } from '../../assignments/homework/format';
import type { TaskDraft } from '../task-types';
import { kindMeta } from '../task-types';
import { PreviewQuestions } from './PreviewQuestions';

/** What a student will see, updated as the teacher types. */
export function StudentPreview({ draft: d, scopeLabel }: { draft: TaskDraft; scopeLabel: string }) {
  const homework = d.kind === 'HOMEWORK';
  const usesQuestions = !homework || d.homeworkMode === 'questions';
  const points = usesQuestions ? d.questions.reduce((t, q) => t + Number(q.points || 0), 0) : d.maxPoints;
  const chips = homework
    ? [[FiClock, `Due ${dateLabel(d.dueAt)}`], [FiTarget, `${points} pts`], [FiRepeat, `${d.maxSubmissions} submission${d.maxSubmissions === 1 ? '' : 's'}`]]
    : [[FiClock, d.durationMinutes ? `${d.durationMinutes} min` : 'No time limit'], [FiFlag, `Pass ${d.passMark}%`], [FiRepeat, `${d.maxAttempts} attempt${d.maxAttempts === 1 ? '' : 's'}`], [FiTarget, `${points} pts`]];
  return (
    <div className="space-y-3">
      <article className="rounded-box border border-base-300 bg-base-100 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">{kindMeta(d.kind).label}{scopeLabel ? ` · ${scopeLabel}` : ''}</p>
        <h2 className="mt-2 text-xl font-semibold">{d.title || <span className="text-muted">Untitled</span>}</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map(([Icon, label]) => { const I = Icon as typeof FiClock; return <span key={String(label)} className="inline-flex items-center gap-1.5 rounded-full bg-base-200 px-2.5 py-1 text-xs"><I aria-hidden />{String(label)}</span>; })}
        </div>
        {d.instructions ? <p className="mt-4 whitespace-pre-line text-sm leading-6">{d.instructions}</p> : <p className="mt-4 text-sm text-muted">Instructions appear here.</p>}
        {d.resources.length ? <ul className="mt-4 space-y-1">{d.resources.filter(r => r.title).map((r, i) => <li key={i} className="flex items-center gap-2 text-sm text-brand"><FiExternalLink aria-hidden />{r.title}</li>)}</ul> : null}
      </article>
      {usesQuestions ? <PreviewQuestions questions={d.questions} /> : (
        <article className="space-y-3 rounded-box border border-base-300 bg-base-100 p-5">
          <p className="text-sm font-semibold">Student answer · {responseLabels[d.responseType]}</p>
          {d.responseType === 'TEXT' || d.responseType === 'MIXED' ? <textarea disabled rows={4} className="textarea w-full" placeholder="Students write their answer here…" /> : null}
          {d.responseType !== 'TEXT' ? <div className="rounded-field border border-dashed border-base-300 p-4 text-center text-xs text-muted">{d.responseType === 'AUDIO' ? 'Record or upload audio' : 'Attach a file'}</div> : null}
          {d.rubric.length ? (
            <div><p className="mb-2 text-xs font-semibold text-muted">How it is marked</p>
              <ul className="space-y-1 text-sm">{d.rubric.map((r, i) => <li key={i} className="flex justify-between gap-3"><span>{r.title || 'Criterion'}</span><span className="text-muted tabular-nums">{r.points} pts</span></li>)}</ul></div>
          ) : null}
        </article>
      )}
    </div>
  );
}
