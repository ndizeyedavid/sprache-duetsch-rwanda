import { FiAlertTriangle } from 'react-icons/fi';
import { humanize } from '../../../lib/services';
import { SearchField } from '../../ui/SearchField';
import type { RosterFilter,RosterSort,RosterStudent } from './roster-data';

type Props = { roster: RosterStudent[]; filter: RosterFilter; onChange: (patch: Partial<RosterFilter>) => void };

const pill = (active: boolean) => `btn btn-xs h-8 rounded-full px-3 ${active ? 'btn-primary' : 'border-line bg-base-100'}`;
const SORTS: { value: RosterSort; label: string }[] = [
  { value: 'name', label: 'Name A–Z' }, { value: 'code', label: 'Student ID' },
  { value: 'attendance', label: 'Lowest attendance' }, { value: 'score', label: 'Lowest score' },
];

/** Search, status pills with live counts, a "needs support" switch and sorting — one row on desktop. */
export function RosterToolbar({ roster, filter, onChange }: Props) {
  const statuses = [...new Set(roster.map((row) => row.status))].sort();
  const flagged = roster.filter((row) => row.risk).length;
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <SearchField value={filter.query} onChange={(query) => onChange({ query })} ariaLabel="Search students" placeholder="Search students…" className="w-full border border-line lg:w-72" />
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by status">
        <button type="button" className={pill(filter.status === 'ALL')} aria-pressed={filter.status === 'ALL'} onClick={() => onChange({ status: 'ALL' })}>All {roster.length}</button>
        {statuses.map((status) => (
          <button key={status} type="button" className={pill(filter.status === status)} aria-pressed={filter.status === status} onClick={() => onChange({ status })}>
            {humanize(status)} {roster.filter((row) => row.status === status).length}
          </button>
        ))}
        <button type="button" className={pill(filter.support)} aria-pressed={filter.support} onClick={() => onChange({ support: !filter.support })} disabled={!flagged && !filter.support}>
          <FiAlertTriangle aria-hidden />Needs support {flagged}
        </button>
      </div>
      <select value={filter.sort} onChange={(event) => onChange({ sort: event.currentTarget.value as RosterSort })} aria-label="Sort students"
        className="select select-sm rounded-full border-line lg:ml-auto lg:w-48">
        {SORTS.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}
      </select>
    </div>
  );
}
