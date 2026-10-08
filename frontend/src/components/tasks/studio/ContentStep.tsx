import { FiPlus, FiX } from 'react-icons/fi';
import { QuestionBuilder } from '../../questions/QuestionBuilder';
import type { TaskDraft } from '../task-types';
import { Segmented } from './fields';
import { WorkFields } from './WorkFields';

/** Questions for quizzes and tests; homework can be questions or open work with a rubric. */
export function ContentStep({ draft: d, update, locked }: { draft: TaskDraft; update: (p: Partial<TaskDraft>) => void; locked: boolean }) {
  const homework = d.kind === 'HOMEWORK';
  const setLink = (i: number, patch: Partial<TaskDraft['resources'][number]>) => update({ resources: d.resources.map((r, n) => n === i ? { ...r, ...patch } : r) });
  return (
    <div className="space-y-5">
      {homework ? (
        <Segmented value={d.homeworkMode} disabled={locked} onChange={homeworkMode => update({ homeworkMode })}
          options={[{ value: 'work', label: 'Students hand in work' }, { value: 'questions', label: 'Students answer questions' }]} />
      ) : null}
      {!homework || d.homeworkMode === 'questions' ? <QuestionBuilder value={d.questions} onChange={questions => update({ questions })} locked={locked} />
        : <WorkFields draft={d} update={update} locked={locked} />}
      {homework ? (
        <details className="rounded-box border border-base-300 p-3" open={d.resources.length > 0}>
          <summary className="cursor-pointer text-sm font-medium">Helpful links {d.resources.length ? `(${d.resources.length})` : ''}</summary>
          <div className="mt-3 space-y-2">
            {d.resources.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input className="input input-sm min-w-0 flex-1" aria-label={`Link ${i + 1} title`} placeholder="Title" value={r.title} onChange={e => setLink(i, { title: e.target.value })} />
                <input type="url" className="input input-sm min-w-0 flex-1" aria-label={`Link ${i + 1} address`} placeholder="https://…" value={r.url} onChange={e => setLink(i, { url: e.target.value })} />
                <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={`Remove link ${i + 1}`} onClick={() => update({ resources: d.resources.filter((_, n) => n !== i) })}><FiX aria-hidden /></button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" disabled={d.resources.length >= 10} onClick={() => update({ resources: [...d.resources, { title: '', url: '' }] })}><FiPlus aria-hidden />Add link</button>
          </div>
        </details>
      ) : null}
    </div>
  );
}
