import type { LevelItem } from '../../lib/services';
import { SearchField } from '../ui/SearchField';
import { SegmentedControl } from '../ui/SegmentedControl';
import type { TeacherFilters,TeacherStatusFilter } from './types';

type Props = { filters: TeacherFilters; levels: LevelItem[]; onChange: (patch: Partial<TeacherFilters>) => void };

const STATUSES: TeacherStatusFilter[] = ['All', 'Active', 'Pending', 'Inactive'];

/** Search, level and account-status filters for the teacher list. */
export function TeachersToolbar({ filters, levels, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <SearchField value={filters.query} onChange={(query) => onChange({ query })} ariaLabel="Search teachers"
        placeholder="Search name or email…" className="lg:max-w-xs" />
      <select aria-label="Filter by level" value={filters.levelId} onChange={(event) => onChange({ levelId: event.target.value })}
        className="select select-sm w-full rounded-full border-line bg-base-100 lg:w-44">
        <option value="">All levels</option>
        {levels.map((level) => <option key={level.id} value={level.id}>{level.code}</option>)}
      </select>
      <SegmentedControl options={STATUSES} value={filters.status} onChange={(status) => onChange({ status: status as TeacherStatusFilter })}
        ariaLabel="Filter by account status" wrap />
    </div>
  );
}
