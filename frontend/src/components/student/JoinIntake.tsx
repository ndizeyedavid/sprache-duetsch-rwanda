import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage, apiGet, apiPost } from '../../lib/api';
import { currencyAmount } from '../../lib/format';
import type { IntakeItem } from '../../lib/services';
import { getMyEnrollments, listLevels } from '../../lib/services';

const getIntakes = () => apiGet<IntakeItem[]>('/intakes?isActive=true&upcoming=true&pageSize=100');

/** Lets a student add a course: pick an intake, then a level offered in it. */
export function JoinIntake({ onJoined }: { onJoined: () => void }) {
  const intakes = useApi('join-intake-options', getIntakes);
  const levels = useApi('join-intake-prices', listLevels);
  const enrolments = useApi('my-enrollments', getMyEnrollments);
  const [intakeId, setIntakeId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);
  const intake = intakes.data?.find(row => row.id === intakeId);
  const taken = new Set((enrolments.data ?? []).filter(row => row.intakeId === intakeId).map(row => row.levelId));
  const offered = levels.data?.filter(row => row.isActive && intake?.levels?.some(level => level.id === row.id && level.isActive)) ?? [];
  const open = offered.filter(row => !taken.has(row.id));
  const level = open.find(row => row.id === levelId);
  const loadError = intakes.error ?? levels.error ?? enrolments.error;

  function join() {
    if (busy || !level) return;
    setBusy(true); setError(null); setJoined(null);
    void apiPost('/enrollments/join', { intakeId, levelId })
      .then(() => { setJoined(level.code); setLevelId(''); enrolments.refetch(); onJoined(); })
      .catch(err => setError(apiErrorMessage(err, 'Could not join this course. Please try again.')))
      .finally(() => setBusy(false));
  }

  return (
    <section className="card learning-panel p-5 sm:p-6">
      <h2 className="text-base font-semibold">Join a course</h2>
      <p className="mt-1 text-sm text-muted">Choose an intake and a level. The course opens once its fee is paid.</p>
      <form className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={event => { event.preventDefault(); join(); }}>
        <label className="text-sm font-medium">Intake
          <select required className="select mt-2 w-full" value={intakeId} disabled={busy || intakes.loading}
            onChange={event => { setIntakeId(event.target.value); setLevelId(''); setJoined(null); }}>
            <option value="">Choose an intake</option>
            {intakes.data?.filter(row => row.levels?.some(item => item.isActive)).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Level
          <select required className="select mt-2 w-full" value={levelId} disabled={busy || !intakeId || levels.loading || !open.length}
            onChange={event => setLevelId(event.target.value)}>
            <option value="">{intakeId && !open.length ? 'No levels left to join' : 'Choose a level'}</option>
            {offered.map(row => <option key={row.id} value={row.id} disabled={taken.has(row.id)}>
              {row.code} · {currencyAmount(Number(row.defaultFee), row.currency)}{taken.has(row.id) ? ' · already joined' : ''}
            </option>)}
          </select>
        </label>
        <button className="btn h-12 rounded-full border-0 bg-brand px-6 text-white hover:bg-brand hover:text-primary-content" disabled={busy || !level} type="submit">
          {busy ? 'Joining…' : 'Join course'}
        </button>
      </form>
      {level ? <p className="mt-3 text-sm text-muted">Course fee: <strong className="text-base-content">{currencyAmount(Number(level.defaultFee), level.currency)}</strong></p> : null}
      {intakeId && offered.length > 0 && !open.length ? <p className="mt-3 text-sm text-muted">You have already joined every level in this intake.</p> : null}
      {joined ? <p role="status" className="mt-3 text-sm">You joined {joined}. <Link className="font-medium text-brand hover:underline" to="/profile?view=payments">Pay the course fee</Link> to open it.</p> : null}
      {error || loadError ? <p className="mt-3 text-sm text-error" role="alert">{error ?? loadError}</p> : null}
    </section>
  );
}
