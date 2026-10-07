import { FiX } from 'react-icons/fi';
import type { ClassGroupItem,IntakeItem,LevelItem } from '../../lib/services';
import { SearchField } from '../ui/SearchField';
import { STATUS_FILTERS } from './constants';
import type { EnrolmentFilters } from './types';
import { classOptionLabel } from './utils';

type Props = {
  filters: EnrolmentFilters;
  onFilter: (patch: Partial<EnrolmentFilters>) => void;
  onClear: () => void;
  hasFilters: boolean;
  levels: LevelItem[];
  intakes: IntakeItem[];
  groups: ClassGroupItem[];
};

const selectClass =
  'select select-sm min-w-0 flex-1 rounded-full border-line bg-base-100 text-xs sm:max-w-44 sm:flex-none';

/** Scoping controls for the register — one row, wrapping to two on phones. */
export function EnrolmentToolbar({
  filters,
  onFilter,
  onClear,
  hasFilters,
  levels,
  intakes,
  groups,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchField
        value={filters.query}
        onChange={(query) => onFilter({ query })}
        ariaLabel="Search enrolments"
        placeholder="Search name, student ID…"
        className="w-full border border-line sm:w-64"
      />
      <select
        aria-label="Filter by level"
        value={filters.levelId}
        onChange={(event) => onFilter({ levelId: event.currentTarget.value })}
        className={selectClass}
      >
        <option value="">All levels</option>
        {levels.map((level) => (
          <option key={level.id} value={level.id}>
            {level.code}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by intake"
        value={filters.intakeId}
        onChange={(event) => onFilter({ intakeId: event.currentTarget.value })}
        className={selectClass}
      >
        <option value="">All intakes</option>
        {intakes.map((intake) => (
          <option key={intake.id} value={intake.id}>
            {intake.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(event) => onFilter({ status: event.currentTarget.value })}
        className={selectClass}
      >
        {STATUS_FILTERS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by class group"
        value={filters.classGroupId}
        onChange={(event) => onFilter({ classGroupId: event.currentTarget.value })}
        className={selectClass}
      >
        <option value="">All classes</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {classOptionLabel(group)}
          </option>
        ))}
      </select>
      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="btn btn-ghost btn-sm gap-1 rounded-full text-xs font-medium text-muted"
        >
          <FiX aria-hidden />
          Clear
        </button>
      ) : null}
      {filters.awaitingOnly ? (
        <span className="badge badge-sm gap-1 rounded-full bg-coral-soft font-medium text-[#D8482F]">
          Awaiting class only
        </span>
      ) : null}
    </div>
  );
}
