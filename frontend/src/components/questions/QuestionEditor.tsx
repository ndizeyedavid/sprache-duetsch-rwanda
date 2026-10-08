import { MatchingEditor } from './MatchingEditor';
import { OrderingEditor } from './OrderingEditor';
import { QuestionChoices } from './QuestionChoices';
import { DIFFICULTIES, QUESTION_TYPES, SKILLS, titleCase } from './question-meta';
import type { AuthoredQuestion } from './types';
import { newQuestion } from './types';

type Props = { value: AuthoredQuestion; index: number; locked: boolean; onChange: (q: AuthoredQuestion) => void };

/** The open question: text, answer key for its type, and a few optional extras. */
export function QuestionEditor({ value: q, index, locked, onChange }: Props) {
  const changeType = (type: string) => onChange({ ...newQuestion(type), id: q.id, prompt: q.prompt, difficulty: q.difficulty, audioUrl: q.audioUrl, imageUrl: q.imageUrl });
  return (
    <div className="space-y-4 border-t border-base-300/70 p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_96px]">
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Type</span>
          <select className="select select-sm w-full" value={q.type} disabled={locked} onChange={e => changeType(e.target.value)}>
            {QUESTION_TYPES.map(([type, meta]) => <option key={type} value={type}>{meta.label}</option>)}
          </select>
        </label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Points</span>
          <input type="number" min="0.5" max={1000} step="0.5" className="input input-sm w-full" aria-label={`Question ${index + 1} points`} value={q.points} disabled={locked}
            onChange={e => onChange({ ...q, points: Number(e.target.value) })} />
        </label>
      </div>
      <label className="block"><span className="mb-1.5 block text-xs font-medium">Question</span>
        <textarea autoFocus={!q.prompt} maxLength={2000} rows={2} className="textarea w-full" aria-label={`Question ${index + 1} text`} placeholder="Write what students should answer…"
          value={q.prompt} disabled={locked} onChange={e => onChange({ ...q, prompt: e.target.value })} />
      </label>
      {q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE' ? <QuestionChoices value={q} onChange={onChange} locked={locked} />
        : q.type === 'TRUE_FALSE' ? (
          <div className="flex gap-2" role="radiogroup" aria-label="Correct answer">
            {['True', 'False'].map(option => (
              <button key={option} type="button" disabled={locked} aria-pressed={String(q.correctAnswer) === option} onClick={() => onChange({ ...q, correctAnswer: option })}
                className={`btn btn-sm flex-1 rounded-full ${String(q.correctAnswer) === option ? 'border-brand bg-brand/10 text-brand' : 'btn-ghost border-base-300'}`}>{option}</button>
            ))}
          </div>
        ) : q.type === 'FILL_BLANK' ? (
          <label className="block"><span className="mb-1.5 block text-xs font-medium">Expected answer</span>
            <input className="input input-sm w-full" aria-label={`Question ${index + 1} correct answer`} placeholder="Marking ignores capital letters" disabled={locked}
              value={typeof q.correctAnswer === 'string' ? q.correctAnswer : ''} onChange={e => onChange({ ...q, correctAnswer: e.target.value })} />
          </label>
        ) : q.type === 'MATCHING' ? <MatchingEditor value={q} onChange={onChange} locked={locked} />
        : q.type === 'ORDERING' ? <OrderingEditor value={q} onChange={onChange} locked={locked} />
        : <p className="rounded-field bg-base-200/60 px-3 py-2 text-xs text-muted">You mark this answer yourself after students submit.</p>}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted">More options · skill, difficulty, image or audio</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label><span className="mb-1.5 block">Skill</span><select className="select select-sm w-full" value={q.skill} disabled={locked} onChange={e => onChange({ ...q, skill: e.target.value })}>{SKILLS.map(s => <option key={s} value={s}>{titleCase(s)}</option>)}</select></label>
          <label><span className="mb-1.5 block">Difficulty</span><select className="select select-sm w-full" value={q.difficulty} disabled={locked} onChange={e => onChange({ ...q, difficulty: e.target.value })}>{DIFFICULTIES.map(d => <option key={d} value={d}>{titleCase(d)}</option>)}</select></label>
          {(['imageUrl', 'audioUrl'] as const).map(key => (
            <label key={key}><span className="mb-1.5 block">{key === 'imageUrl' ? 'Image link' : 'Audio link'}</span>
              <input className="input input-sm w-full" placeholder="https://…" value={q[key] ?? ''} disabled={locked} onChange={e => onChange({ ...q, [key]: e.target.value || null })} /></label>
          ))}
        </div>
      </details>
    </div>
  );
}
