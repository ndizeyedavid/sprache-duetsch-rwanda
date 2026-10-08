import { useApi } from '../../../hooks/useApi';
import { getHomeworkRoster } from '../../../lib/homework';

/** Whole class by default; tick students to assign only them. */
export function RecipientPicker({ classGroupId, value, onChange, disabled }: { classGroupId: string; value: string[]; onChange: (ids: string[]) => void; disabled: boolean }) {
  const roster = useApi(`task-roster-${classGroupId}`, () => getHomeworkRoster(classGroupId), !!classGroupId);
  const students = roster.data ?? [];
  return (
    <div className="rounded-field border border-base-300">
      <div className="flex items-center justify-between border-b border-base-300 px-3 py-2 text-xs">
        <span className="font-medium">{value.length ? `${value.length} of ${students.length} students` : `Whole class${students.length ? ` · ${students.length} students` : ''}`}</span>
        {value.length ? <button type="button" className="link link-primary" disabled={disabled} onClick={() => onChange([])}>Assign to whole class</button> : null}
      </div>
      <div className="max-h-40 space-y-1.5 overflow-y-auto p-3">
        {roster.loading ? <p className="text-xs text-muted">Loading students…</p> : roster.error ? <p className="text-xs text-error">{roster.error}</p>
          : !students.length ? <p className="text-xs text-muted">{classGroupId ? 'No students in this class yet.' : 'Choose a class first.'}</p>
          : students.map(s => (
            <label key={s.id} className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="checkbox checkbox-xs" disabled={disabled} checked={value.includes(s.id)}
                onChange={e => onChange(e.target.checked ? [...value, s.id] : value.filter(id => id !== s.id))} />
              {s.user.firstName} {s.user.lastName}<span className="text-muted">{s.studentCode}</span>
            </label>
          ))}
      </div>
    </div>
  );
}
