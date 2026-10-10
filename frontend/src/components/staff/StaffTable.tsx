import type { UserRow } from '../../lib/services';
import { StatusBadge } from '../ui/StatusBadge';
import { ROLE_LABELS } from './constants';
import { StaffRowActions } from './StaffRowActions';
import type { StaffDialog } from './types';
import { initials,lastSeenLabel,staffName,statusLabel,surfaceFor } from './utils';

type Props = {
  rows: UserRow[];
  currentUserId: string;
  isSuper: boolean;
  manageableRoles: string[];
  onOpen: (dialog: StaffDialog) => void;
};

/** Desktop register — the roster an academic admin scans and works down. */
export function StaffTable({
  rows,
  currentUserId,
  isSuper,
  manageableRoles,
  onOpen,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full text-xs">
        <caption className="sr-only">
          Staff accounts with role, status and last sign-in
        </caption>
        <thead>
          <tr className="text-muted">
            <th scope="col" className="text-left">Staff member</th>
            <th scope="col" className="text-left">Role</th>
            <th scope="col" className="text-left">Phone</th>
            <th scope="col" className="text-left">Status</th>
            <th scope="col" className="text-left">Last sign-in</th>
            <th scope="col" className="text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-line align-middle">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={`grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${surfaceFor(row.status)}`}
                  >
                    {initials(row)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink">
                      {staffName(row)}
                      {row.id === currentUserId ? (
                        <span className="ml-1.5 text-[10px] font-normal text-muted">you</span>
                      ) : null}
                    </span>
                    <span className="block truncate text-muted">{row.email}</span>
                  </span>
                </div>
              </td>
              <td className="py-3 pr-4 font-medium text-ink">
                {ROLE_LABELS[row.role] ?? statusLabel(row.role)}
              </td>
              <td className="py-3 pr-4 tabular-nums text-ink">
                {row.phone ?? <span className="text-muted">—</span>}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={statusLabel(row.status)} />
              </td>
              <td className="py-3 pr-4 text-muted">
                {row.lastLoginAt ? (
                  lastSeenLabel(row.lastLoginAt)
                ) : (
                  <span className="font-medium text-brand">Never signed in</span>
                )}
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <StaffRowActions
                    row={row}
                    manageable={manageableRoles.includes(row.role)}
                    isSuper={isSuper}
                    isSelf={row.id === currentUserId}
                    onOpen={onOpen}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}