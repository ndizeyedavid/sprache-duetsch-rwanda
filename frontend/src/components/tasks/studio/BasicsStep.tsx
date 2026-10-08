import type { TaskDraft, TaskKind } from '../task-types';
import { KINDS, TEST_TYPES } from '../task-types';
import { Field } from './fields';

type Option = { id: string; label: string };
type Props = { draft: TaskDraft; update: (p: Partial<TaskDraft>) => void; switchKind: (k: TaskKind) => void; creating: boolean; locked: boolean; classes: Option[]; levels: Option[] };

export function BasicsStep({ draft: d, update, switchKind, creating, locked, classes, levels }: Props) {
  const homework = d.kind === 'HOMEWORK';
  return (
    <div className="space-y-5">
      {creating ? (
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="What are you creating?">
          {KINDS.map(k => {
            const Icon = k.icon; const active = d.kind === k.kind;
            return (
              <button key={k.kind} type="button" role="radio" aria-checked={active} onClick={() => switchKind(k.kind)}
                className={`rounded-box border p-3 text-left transition-colors ${active ? 'border-brand bg-brand/5' : 'border-base-300 hover:border-brand/30'}`}>
                <span className={`flex items-center gap-2 text-sm font-semibold ${active ? 'text-brand' : ''}`}><Icon aria-hidden />{k.label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted">{k.hint}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={homework ? 'Class' : 'Level'}>
          <select className="select select-sm w-full" disabled={!creating && homework} value={homework ? d.classGroupId : d.levelId}
            onChange={e => update(homework ? { classGroupId: e.target.value, studentIds: [] } : { levelId: e.target.value })}>
            <option value="">Choose a {homework ? 'class' : 'level'}</option>
            {(homework ? classes : levels).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </Field>
        {d.kind === 'TEST' ? (
          <Field label="Test type" hint={TEST_TYPES.find(t => t.value === d.testType)?.hint}>
            <select className="select select-sm w-full" value={d.testType} onChange={e => update({ testType: e.target.value as TaskDraft['testType'] })}>
              {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
        ) : null}
      </div>
      <Field label="Title">
        <input className="input w-full text-base font-medium" maxLength={160} placeholder={homework ? 'e.g. Introduce yourself in German' : 'e.g. A1 Unit 3 — Numbers and time'}
          value={d.title} onChange={e => update({ title: e.target.value })} />
      </Field>
      <Field label="Instructions for students" hint={homework ? 'Short steps and the expected length work best.' : 'Shown before students start. Optional.'}>
        <textarea rows={6} maxLength={homework ? 20000 : 2000} disabled={locked} className="textarea w-full text-sm leading-6"
          placeholder={homework ? 'Your goal: …\n1. Prepare …\n2. Write or record …\nSubmit: …' : 'e.g. Read each question carefully. You have one attempt.'}
          value={d.instructions} onChange={e => update({ instructions: e.target.value })} />
      </Field>
    </div>
  );
}
