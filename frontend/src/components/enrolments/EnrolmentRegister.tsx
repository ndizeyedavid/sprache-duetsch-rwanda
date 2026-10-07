import { FiRefreshCw,FiUserPlus } from 'react-icons/fi';
import type { ApiState } from '../../hooks/useApi';
import type { ClassGroupItem,EnrollmentRow,IntakeItem,LevelItem } from '../../lib/services';
import { ErrorBlock,LoadingBlock } from '../common/PageState';
import { Panel } from '../ui/Panel';
import { EnrolmentCard } from './EnrolmentCard';
import { EnrolmentEmpty } from './EnrolmentEmpty';
import { EnrolmentTable } from './EnrolmentTable';
import { EnrolmentToolbar } from './EnrolmentToolbar';
import type { EnrolmentFilters } from './types';
import { hasActiveFilters } from './utils';

type Props = {
  state: ApiState<EnrollmentRow[]>;
  rows: EnrollmentRow[];
  visible: EnrollmentRow[];
  filters: EnrolmentFilters;
  onFilter: (patch: Partial<EnrolmentFilters>) => void;
  onClear: () => void;
  onManage: (row: EnrollmentRow) => void;
  onCreate: () => void;
  savingId: string | null;
  levels: LevelItem[];
  intakes: IntakeItem[];
  groups: ClassGroupItem[];
};

/** Register panel: heading, scoping controls, then the right list for the viewport. */
export function EnrolmentRegister({
  state,
  rows,
  visible,
  filters,
  onFilter,
  onClear,
  onManage,
  onCreate,
  savingId,
  levels,
  intakes,
  groups,
}: Props) {
  const filtered = hasActiveFilters(filters);
  const countLabel =
    visible.length === rows.length
      ? `${rows.length} enrolment${rows.length === 1 ? '' : 's'}`
      : `${visible.length} of ${rows.length} shown`;

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold sm:text-lg">Enrolment register</h2>
          <p className="text-xs text-muted">{countLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreate}
            className="btn btn-sm gap-2 rounded-full border-0 bg-brand text-xs font-medium text-white hover:bg-night"
          >
            <FiUserPlus aria-hidden />
            Enrol a student
          </button>
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
        </div>
      </div>

      <div className="mt-4">
        <EnrolmentToolbar
          filters={filters}
          onFilter={onFilter}
          onClear={onClear}
          hasFilters={filtered}
          levels={levels}
          intakes={intakes}
          groups={groups}
        />
      </div>

      <div className="mt-4">
        {state.loading ? (
          <LoadingBlock label="Loading enrolments…" />
        ) : state.error || !state.data ? (
          <ErrorBlock message={state.error ?? 'Could not load enrolments.'} onRetry={state.refetch} />
        ) : visible.length === 0 ? (
          <EnrolmentEmpty filtered={filtered} onClear={onClear} />
        ) : (
          <>
            <div className="hidden md:block">
              <EnrolmentTable rows={visible} savingId={savingId} onManage={onManage} />
            </div>
            <ul className="space-y-3 md:hidden">
              {visible.map((row) => (
                <EnrolmentCard key={row.id} row={row} onManage={onManage} />
              ))}
            </ul>
          </>
        )}
      </div>
    </Panel>
  );
}
