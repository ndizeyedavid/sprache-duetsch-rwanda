import type { TaskDraft, TaskStatus } from '../task-types';
import { DateTimeField, Field, NumberField, Segmented, Toggle } from './fields';
import { RecipientPicker } from './RecipientPicker';

type Props = { draft: TaskDraft; update: (p: Partial<TaskDraft>) => void; locked: boolean; existing: boolean };

/** When it opens and closes, how many tries, and who can see it. */
export function SettingsStep({ draft: d, update, locked, existing }: Props) {
  const homework = d.kind === 'HOMEWORK';
  const statuses: { value: TaskStatus; label: string }[] = [{ value: 'DRAFT', label: 'Draft' }, { value: 'PUBLISHED', label: 'Published' }, ...(homework && existing ? [{ value: 'ARCHIVED' as const, label: 'Archived' }] : [])];
  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Who can see it</h3>
        <Segmented value={d.status} options={statuses} onChange={status => update({ status })} />
        <p className="text-xs text-muted">{d.status === 'DRAFT' ? 'Only staff can see drafts.' : d.status === 'ARCHIVED' ? 'Hidden from students. Their work is kept.' : homework ? 'Students see it from the release date.' : 'Students see it between the opening and closing times.'}</p>
      </section>
      {homework ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <DateTimeField label="Release · your time" value={d.releaseAt} onChange={releaseAt => update({ releaseAt })} />
            <DateTimeField label="Due · your time" value={d.dueAt} onChange={dueAt => update({ dueAt })} />
            <NumberField label="Expected effort (minutes)" value={d.estimatedMinutes} min={1} max={600} onChange={estimatedMinutes => update({ estimatedMinutes })} />
            <NumberField label="Submissions allowed" hint="Includes revisions you request." value={d.maxSubmissions} min={1} max={20} onChange={maxSubmissions => update({ maxSubmissions })} />
          </div>
          <Toggle label="Accept late work" hint="Late work is labelled late." checked={d.allowLate} onChange={allowLate => update({ allowLate })} />
          <Field label="Students"><RecipientPicker classGroupId={d.classGroupId} value={d.studentIds} disabled={locked} onChange={studentIds => update({ studentIds })} /></Field>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <DateTimeField label="Opens · your time" value={d.availableFrom} onChange={availableFrom => update({ availableFrom })} />
            <DateTimeField label="Closes · your time" value={d.availableUntil} onChange={availableUntil => update({ availableUntil })} />
            <NumberField label="Attempts allowed" value={d.maxAttempts} min={1} max={100} onChange={maxAttempts => update({ maxAttempts })} />
            <NumberField label="Pass mark (%)" value={d.passMark} min={0} max={100} onChange={passMark => update({ passMark })} />
          </div>
          <Toggle label="Time limit" hint={d.durationMinutes ? 'The attempt submits itself when time runs out.' : 'Students can take as long as they need.'}
            checked={d.durationMinutes !== null} onChange={on => update({ durationMinutes: on ? (d.kind === 'QUIZ' ? 15 : 45) : null })} />
          {d.durationMinutes !== null ? <NumberField label="Minutes" value={d.durationMinutes} min={1} max={600} onChange={durationMinutes => update({ durationMinutes })} /> : null}
          <Toggle label="Exam mode" hint="Full screen, and leaving the page is recorded for review." checked={d.protectedMode} onChange={protectedMode => update({ protectedMode })} />
        </>
      )}
    </div>
  );
}
