import { FiPlus } from 'react-icons/fi';
import type { Question } from './editor-config';
import { emptyQuestion,moveItem } from './editor-config';
import { RowButtons } from './RowButtons';

/** Comprehension questions, each with options and one correct answer. */
export function QuestionListEditor({ questions, onChange }: { questions: Question[]; onChange: (questions: Question[]) => void }) {
  const edit = (i: number, patch: Partial<Question>) => onChange(questions.map((q, n) => n === i ? { ...q, ...patch } : q));
  return <div className="space-y-3">
    <p className="text-sm font-medium">Questions</p>
    {questions.map((q, i) => <fieldset key={i} className="space-y-2 rounded-box bg-base-200 p-3">
      <div className="flex items-center gap-2">
        <input required className="input input-sm min-w-0 grow" aria-label={`Question ${i + 1}`} placeholder={`Question ${i + 1}`} value={q.prompt} onChange={event => edit(i, { prompt: event.target.value })} />
        <RowButtons label={`question ${i + 1}`} index={i} count={questions.length} onMove={to => onChange(moveItem(questions, i, to))} onRemove={() => onChange(questions.filter((_, n) => n !== i))} />
      </div>
      {q.options.map((option, o) => <div key={o} className="flex items-center gap-2 pl-2">
        <input type="radio" className="radio radio-xs" name={`question-${i}-correct`} aria-label={`Answer ${o + 1} of question ${i + 1} is correct`} checked={q.correctIndex === o} onChange={() => edit(i, { correctIndex: o })} />
        <input required className="input input-xs min-w-0 grow" aria-label={`Answer ${o + 1} of question ${i + 1}`} placeholder={`Answer ${o + 1}`} value={option}
          onChange={event => edit(i, { options: q.options.map((v, n) => n === o ? event.target.value : v) })} />
        <button type="button" className="btn btn-ghost btn-xs" aria-label={`Remove answer ${o + 1}`} disabled={q.options.length <= 2}
          onClick={() => edit(i, { options: q.options.filter((_, n) => n !== o), correctIndex: q.correctIndex > o ? q.correctIndex - 1 : q.correctIndex === o ? 0 : q.correctIndex })}>×</button>
      </div>)}
      {q.options.length < 6 ? <button type="button" className="btn btn-ghost btn-xs" onClick={() => edit(i, { options: [...q.options, ''] })}><FiPlus aria-hidden />Answer</button> : null}
    </fieldset>)}
    <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange([...questions, emptyQuestion()])}><FiPlus aria-hidden />Add question</button>
  </div>;
}
