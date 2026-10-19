import { useState } from 'react';
import { FiArrowUpRight,FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useSession } from '../../lib/session';
import { AllIntakesOption } from './AllIntakesOption';
import { useIntakeScopeDetails } from './intake-context';
import { IntakeOption } from './IntakeOption';
import { matches,sortIntakes } from './utils';

/** Drop-down list of intakes with search, the "all intakes" escape hatch and a manage link. */
export function IntakePanel({ onDone }: { onDone: () => void }) {
  const { intakes, selected, loading, error, select, refetch } = useIntakeScopeDetails();
  const { user } = useSession();
  const [query, setQuery] = useState('');
  const visible = sortIntakes(intakes).filter((intake) => matches(intake, query));
  const canManage = user?.role === 'ACADEMIC_ADMIN' || user?.role === 'SUPER_ADMIN';
  const choose = (id: string | null) => { select(id); onDone(); };

  return (
    <div role="dialog" aria-label="Choose an intake"
      className="fixed inset-x-3 top-[4.75rem] z-50 flex max-h-[min(75vh,40rem)] flex-col overflow-hidden rounded-box border border-line bg-base-100 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[26rem]">
      <div className="hero-band px-4 py-3">
        <p className="text-sm font-semibold">Work in one intake</p>
        <p className="text-xs">Dashboards, students, classes and money follow your choice. Saved for your account on this device.</p>
      </div>
      <div className="space-y-2 overflow-y-auto p-3">
        {intakes.length > 5 ? (
          <label className="input input-sm flex w-full items-center gap-2 rounded-full">
            <FiSearch aria-hidden className="text-muted" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search intakes or levels" aria-label="Search intakes" />
          </label>
        ) : null}
        <AllIntakesOption intakes={intakes} active={!selected} onSelect={() => choose(null)} />
        {loading ? <p className="p-3 text-center text-xs text-muted">Loading intakes…</p> : null}
        {error ? (
          <p className="rounded-box bg-muted-soft p-3 text-xs">{error} <button type="button" className="link font-semibold" onClick={refetch}>Try again</button></p>
        ) : null}
        {visible.map((intake) => (
          <IntakeOption key={intake.id} intake={intake} active={selected?.id === intake.id} onSelect={() => choose(intake.id)} />
        ))}
        {!loading && !error && !visible.length ? <p className="p-3 text-center text-xs text-muted">No intakes match.</p> : null}
      </div>
      {canManage ? (
        <Link to="/admin/intakes" onClick={onDone} className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs font-semibold hover:bg-base-200">
          Manage intakes <FiArrowUpRight aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
