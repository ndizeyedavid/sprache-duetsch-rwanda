import { FiEdit2,FiKey,FiShield,FiUserCheck,FiUserX } from 'react-icons/fi';
import type { UserRow } from '../../lib/services';
import type { RowMenuItem } from '../ui/RowMenu';
import { RowMenu } from '../ui/RowMenu';
import type { StaffDialog } from './types';
import { lockoutReason } from './utils';

type Props = {
  row: UserRow;
  /** False when the API would 403 on `PATCH /users/:id` for this row. */
  manageable: boolean;
  isSuper: boolean;
  /** Guards against locking yourself out of your own account. */
  isSelf: boolean;
  onOpen: (dialog: StaffDialog) => void;
};

/** Role-aware action list for one account. Anything the API would refuse is absent. */
export function StaffRowActions({ row, manageable, isSuper, isSelf, onOpen }: Props) {
  if (!manageable) {
    return <span className="text-[11px] text-muted">Managed by a super admin</span>;
  }

  const items: RowMenuItem[] = [
    {
      label: 'Edit name and phone',
      icon: FiEdit2,
      onClick: () => onOpen({ kind: 'profile', row }),
    },
    {
      label: isSelf
        ? `${row.status === 'SUSPENDED' ? 'Reactivate account' : 'Suspend account'} — ${lockoutReason('status')}`
        : row.status === 'SUSPENDED'
          ? 'Reactivate account'
          : 'Suspend account',
      icon: row.status === 'SUSPENDED' ? FiUserCheck : FiUserX,
      tone: row.status === 'SUSPENDED' ? 'default' : 'danger',
      disabled: isSelf,
      onClick: () => onOpen({ kind: 'profile', row }),
    },
  ];

  if (isSuper) {
    items.push(
      {
        label: isSelf
          ? `Change role — ${lockoutReason('role')}`
          : 'Change role',
        icon: FiShield,
        // The API has no self-demotion guard, so the lockout risk is ours to block.
        disabled: isSelf,
        onClick: () => onOpen({ kind: 'role', row }),
      },
      {
        label: isSelf
          ? `Reset password — ${lockoutReason('password')}`
          : 'Reset password',
        icon: FiKey,
        // Resetting your own password revokes this very session — leave it to Settings.
        disabled: isSelf,
        onClick: () => onOpen({ kind: 'password', row }),
      },
    );
  }

  return <RowMenu label={`Actions for ${row.email}`} items={items} />;
}