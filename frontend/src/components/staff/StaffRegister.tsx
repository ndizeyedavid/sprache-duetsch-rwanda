import { FiPlus,FiRefreshCw } from 'react-icons/fi';
import type { ApiState } from '../../hooks/useApi';
import type { UserRow } from '../../lib/services';
import { ErrorBlock,LoadingBlock } from '../common/PageState';
import { Panel } from '../ui/Panel';
import { StaffCard } from './StaffCard';
import { StaffEmpty } from './StaffEmpty';
import { StaffTable } from './StaffTable';
import { StaffToolbar } from './StaffToolbar';
import type { StaffDialog,StaffFilters } from './types';
import { hasActiveFilters } from './utils';

type Props = {
  state: ApiState<UserRow[]>;
  rows: UserRow[];
  visible: UserRow[];
  filters: StaffFilters;
  currentUserId: string;
  isSuper: boolean;
  manageableRoles: string[];
  creating: boolean;
  onFilter: (patch: Partial<StaffFilters>) => void;
  onClear: () => void;
  onCreate: () => void;
  onOpen: (dialog: StaffDialog) => void;
};

/** Register panel: the create action, scoping controls, then the list for the viewport. */
export function StaffRegister({
  state,
  rows,
  visible,
  filters,
  currentUserId,
  isSuper,
  manageableRoles,
  creating,
  onFilter,
  onClear,
  onCreate,
  onOpen,
}: Props) {
  const filtered = hasActiveFilters(filters);
  const countLabel =
    visible.length === rows.length
      ? `${rows.length} staff account${rows.length === 1 ? '' : 's'}`
      : `${visible.length} of ${rows.length} shown`;

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold sm:text-lg">Staff directory</h2>
          <p className="text-xs text-muted">{countLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={state.refetch}
            disabled={state.fetching}
            className="btn btn-sm gap-2 rounded-full border-line bg-base-200 text-xs font-medium text-ink disabled:opacity-60"
          >
            {state.fetching ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <FiRefreshCw aria-hidden />
            )}
            Refresh
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={creating}
            className="btn btn-sm gap-2 rounded-full border-0 bg-brand text-xs font-medium text-white hover:bg-night"
          >
            <FiPlus aria-hidden />
            Add staff account
          </button>
        </div>
      </div>

      <div className="mt-4">
        <StaffToolbar
          filters={filters}
          onFilter={onFilter}
          onClear={onClear}
          hasFilters={filtered}
        />
      </div>

      <div className="mt-4">
        {state.loading ? (
          <LoadingBlock label="Loading staff accounts…" />
        ) : state.error || !state.data ? (
          <ErrorBlock
            message={state.error ?? 'Could not load staff accounts.'}
            onRetry={state.refetch}
          />
        ) : visible.length === 0 ? (
          <StaffEmpty filtered={filtered} onClear={onClear} />
        ) : (
          <>
            <div className="hidden md:block">
              <StaffTable
                rows={visible}
                currentUserId={currentUserId}
                isSuper={isSuper}
                manageableRoles={manageableRoles}
                onOpen={onOpen}
              />
            </div>
            <ul className="space-y-3 md:hidden">
              {visible.map((row) => (
                <StaffCard
                  key={row.id}
                  row={row}
                  isSuper={isSuper}
                  manageable={manageableRoles.includes(row.role)}
                  isSelf={row.id === currentUserId}
                  onOpen={onOpen}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </Panel>
  );
}