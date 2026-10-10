import { FiX } from 'react-icons/fi';
import type { LevelItem } from '../../lib/services';
import { SearchField } from '../ui/SearchField';
import { selectField,TEACHER_STATUS_FILTERS } from './constants';
import type { TeacherStatusFilter,TeachingFilters } from './types';

type TeachingToolbarProps = {
  filters: TeachingFilters;
  onFilter: (patch: Partial<TeachingFilters>) => void;
  onClear: () => void;
  hasFilters: boolean;
  levels: LevelItem[];
};

/** Scoping controls for both rosters — one row, wrapping to two on phones. */
export function TeachingToolbar({
  filters,
  onFilter,
  onClear,
  hasFilters,
  levels,
}: TeachingToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchField
        value={filters.query}
        onChange={(query) => onFilter({ query })}
        ariaLabel="Search teachers and classes"
        placeholder="Search teacher, class, intake…"
        className="w-full border border-line sm:w-64"
      />
      <select
        aria-label="Filter by level"
        value={filters.levelId}
        onChange={(event) => onFilter({ levelId: event.currentTarget.value })}
        className={selectField}
      >
        <option value="">All levels</option>
        {levels.map((level) => (
          <option key={level.id} value={level.id}>
            {level.code}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by teacher account status"
        value={filters.teacherStatus}
        onChange={(event) =>
          onFilter({ teacherStatus: event.currentTarget.value as TeacherStatusFilter })
        }
        className={selectField}
      >
        {TEACHER_STATUS_FILTERS.map((option) => (
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
    </div>
  );
}