import { FiX } from 'react-icons/fi';
import { useIntakeScope } from '../../lib/intake-scope/store';
import type { ClassGroupItem,IntakeItem,LevelItem } from '../../lib/services';
import { SearchField } from '../ui/SearchField';
import { ACCESS_FILTERS,ACTIVITY_FILTERS,STATUS_FILTERS } from './constants';
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
  campuses: { id: string; name: string }[];
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
  campuses,
}: Props) {
  // The header intake switcher already scopes the register; a second intake filter would only conflict.
  const scoped = Boolean(useIntakeScope());
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchField
        value={filters.query}
        onChange={(query) => onFilter({ query })}
        ariaLabel="Search enrolments"
        placeholder="Search name, ID, email, phone…"
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
      {scoped ? null : <select
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
      </select>}
      {campuses.length > 1 ? <select
        aria-label="Filter by campus"
        value={filters.campusId}
        onChange={(event) => onFilter({ campusId: event.currentTarget.value })}
        className={selectClass}
      >
        <option value="">All campuses</option>
        {campuses.map((campus) => (
          <option key={campus.id} value={campus.id}>
            {campus.name}
          </option>
        ))}
      </select> : null}
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
      <select
        aria-label="Filter by course access"
        value={filters.access}
        onChange={(event) => onFilter({ access: event.currentTarget.value })}
        className={selectClass}
      >
        {ACCESS_FILTERS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by learning activity"
        value={filters.activity}
        onChange={(event) => onFilter({ activity: event.currentTarget.value })}
        className={selectClass}
      >
        {ACTIVITY_FILTERS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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
        <span className="badge badge-sm gap-1 rounded-full bg-coral text-error-content font-medium text-[#D8482F]">
          Awaiting class only
        </span>
      ) : null}
    </div>
  );
}
