import { useApi } from '../../hooks/useApi';
import { listLevels } from '../../lib/services';

export function IntakeLevelPicker({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const levels = useApi('intake-offered-levels', listLevels);
  return <fieldset className="rounded-box border border-base-300 p-4">
    <legend className="px-1 text-sm font-semibold">Levels offered in this intake</legend>
    <p className="mb-3 text-xs text-muted">Choose at least one level. Joining an intake is free; students pay the course price for their chosen level.</p>
    {levels.loading ? <p role="status" className="text-xs">Loading levels…</p> : null}
    {levels.error ? <p className="text-xs text-error" role="alert">{levels.error}<button type="button" className="btn btn-xs" onClick={levels.refetch}>Retry</button></p> : null}
    <div className="grid gap-3 sm:grid-cols-2">{levels.data?.filter(level => level.isActive || selected.includes(level.id)).map(level => <label key={level.id} className="flex items-center gap-3 text-sm">
      <input className="checkbox checkbox-sm" type="checkbox" checked={selected.includes(level.id)} onChange={event => onChange(event.target.checked ? [...selected, level.id] : selected.filter(id => id !== level.id))} />
      {level.code} · {level.title}{!level.isActive ? ' (inactive)' : ''}
    </label>)}</div>
  </fieldset>;
}
