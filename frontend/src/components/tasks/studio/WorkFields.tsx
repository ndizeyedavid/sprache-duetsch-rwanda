import { FiPlus, FiX } from 'react-icons/fi';
import { responseLabels } from '../../assignments/homework/format';
import type { TaskDraft } from '../task-types';
import { Field, NumberField } from './fields';

/** Open-ended homework: what students hand in, total points and an optional rubric. */
export function WorkFields({ draft: d, update, locked }: { draft: TaskDraft; update: (p: Partial<TaskDraft>) => void; locked: boolean }) {
  const setRow = (i: number, patch: Partial<TaskDraft['rubric'][number]>) => update({ rubric: d.rubric.map((r, n) => n === i ? { ...r, ...patch } : r) });
  const rubricTotal = d.rubric.reduce((t, r) => t + Number(r.points || 0), 0);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Students hand in">
          <select className="select select-sm w-full" disabled={locked} value={d.responseType} onChange={e => update({ responseType: e.target.value as TaskDraft['responseType'] })}>
            {Object.entries(responseLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
        <NumberField label="Total points" value={d.maxPoints} min={1} max={1000} disabled={locked} onChange={maxPoints => update({ maxPoints })} />
      </div>
      <section>
        <div className="mb-2 flex items-center justify-between">
          <div><h3 className="text-sm font-semibold">Marking rubric</h3><p className="text-xs text-muted">Optional. Students see it before they start.{d.rubric.length ? ` ${rubricTotal}/${d.maxPoints} points used.` : ''}</p></div>
          <button type="button" className="btn btn-ghost btn-sm" disabled={locked || d.rubric.length >= 10} onClick={() => update({ rubric: [...d.rubric, { title: '', description: '', points: 1 }] })}><FiPlus aria-hidden />Add criterion</button>
        </div>
        <ul className="space-y-2">
          {d.rubric.map((r, i) => (
            <li key={i} className="grid gap-2 rounded-field border border-base-300 p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_72px_auto]">
              <input className="input input-sm" aria-label={`Criterion ${i + 1} name`} placeholder="e.g. Vocabulary" disabled={locked} value={r.title} onChange={e => setRow(i, { title: e.target.value })} />
              <input className="input input-sm" aria-label={`Criterion ${i + 1} description`} placeholder="What does good work show?" disabled={locked} value={r.description} onChange={e => setRow(i, { description: e.target.value })} />
              <input type="number" min="0.5" step="0.5" className="input input-sm" aria-label={`Criterion ${i + 1} points`} disabled={locked} value={r.points} onChange={e => setRow(i, { points: Number(e.target.value) })} />
              <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={`Remove criterion ${i + 1}`} disabled={locked} onClick={() => update({ rubric: d.rubric.filter((_, n) => n !== i) })}><FiX aria-hidden /></button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
