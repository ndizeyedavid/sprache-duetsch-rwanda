import { FiX } from 'react-icons/fi';
import { SearchField } from '../ui/SearchField';
import { FILTER_ROLES,ROLE_LABELS,STATUS_OPTIONS } from './constants';
import type { StaffFilters } from './types';

type Props = {
  filters: StaffFilters;
  onFilter: (patch: Partial<StaffFilters>) => void;
  onClear: () => void;
  hasFilters: boolean;
};

const selectClass =
  'select select-sm min-w-0 flex-1 rounded-full border-line bg-base-100 text-xs sm:max-w-48 sm:flex-none';

/** Scoping controls for the roster — one row, wrapping to two on phones. */
export function StaffToolbar({ filters, onFilter, onClear, hasFilters }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchField
        value={filters.query}
        onChange={(query) => onFilter({ query })}
        ariaLabel="Search staff accounts"
        placeholder="Search name, email or phone…"
        className="w-full border border-line sm:w-64"
      />
      <select
        aria-label="Filter by role"
        value={filters.role}
        onChange={(event) => onFilter({ role: event.currentTarget.value })}
        className={selectClass}
      >
        <option value="">All roles</option>
        {FILTER_ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by account status"
        value={filters.status}
        onChange={(event) => onFilter({ status: event.currentTarget.value })}
        className={selectClass}
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
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