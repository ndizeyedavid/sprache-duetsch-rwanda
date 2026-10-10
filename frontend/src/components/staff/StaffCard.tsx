import { FiClock,FiPhone } from 'react-icons/fi';
import type { UserRow } from '../../lib/services';
import { isoDate } from '../../lib/services';
import { StatusBadge } from '../ui/StatusBadge';
import { ROLE_LABELS } from './constants';
import { StaffRowActions } from './StaffRowActions';
import type { StaffDialog } from './types';
import { initials,lastSeenLabel,staffName,statusLabel,surfaceFor } from './utils';

type Props = {
  row: UserRow;
  isSuper: boolean;
  manageable: boolean;
  isSelf: boolean;
  onOpen: (dialog: StaffDialog) => void;
};

/** Phone-first replacement for the table row: one account per card, same facts. */
export function StaffCard({ row, isSuper, manageable, isSelf, onOpen }: Props) {
  return (
    <li className="rounded-field border border-line bg-base-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold ${surfaceFor(row.status)}`}
          >
            {initials(row)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {staffName(row)}
              {isSelf ? <span className="ml-1.5 text-[10px] font-normal text-muted">you</span> : null}
            </p>
            <p className="truncate text-[11px] text-muted">{row.email}</p>
          </div>
        </div>
        <StatusBadge status={statusLabel(row.status)} className="shrink-0 px-3 py-1" />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
        <div className="col-span-2">
          <dt className="text-muted">Role</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {ROLE_LABELS[row.role] ?? statusLabel(row.role)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-muted">
            <FiPhone aria-hidden />Phone
          </dt>
          <dd className="mt-0.5 font-medium tabular-nums text-ink">
            {row.phone ?? <span className="text-muted">—</span>}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-muted">
            <FiClock aria-hidden />Last sign-in
          </dt>
          <dd
            className={`mt-0.5 font-medium ${row.lastLoginAt ? 'text-ink' : 'text-brand'}`}
          >
            {row.lastLoginAt ? lastSeenLabel(row.lastLoginAt) : 'Never'}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted">Added {isoDate(row.createdAt)}</span>
        <StaffRowActions
          row={row}
          manageable={manageable}
          isSuper={isSuper}
          isSelf={isSelf}
          onOpen={onOpen}
        />
      </div>
    </li>
  );
}