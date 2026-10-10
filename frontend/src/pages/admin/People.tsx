import { useMemo,useState } from 'react';
import { StaffCreateDialog } from '../../components/staff/StaffCreateDialog';
import { StaffFeedback } from '../../components/staff/StaffFeedback';
import { StaffManageDialog } from '../../components/staff/StaffManageDialog';
import { StaffPasswordDialog } from '../../components/staff/StaffPasswordDialog';
import { StaffRegister } from '../../components/staff/StaffRegister';
import { StaffRoleDialog } from '../../components/staff/StaffRoleDialog';
import { StaffSummary } from '../../components/staff/StaffSummary';
import { EMPTY_FILTERS,capabilityFor } from '../../components/staff/constants';
import type { StaffDialog,StaffDraft,StaffFilters } from '../../components/staff/types';
import { useStaffActions } from '../../components/staff/useStaffActions';
import {
filterStaff,
resetFilters,
staffOnly,
staffStats,
} from '../../components/staff/utils';
import { useApi } from '../../hooks/useApi';
import { listUsers } from '../../lib/services';
import { useSession } from '../../lib/session';

export function AdminPeople() {
  const { user: me } = useSession();
  const capability = capabilityFor(me?.role);

  // Fetched unfiltered so the summary tiles and the client-side facets always agree.
  const users = useApi('admin-staff-directory', () => listUsers());
  const actions = useStaffActions(users.refetch);

  const [filters, setFilters] = useState<StaffFilters>(EMPTY_FILTERS);
  const [dialog, setDialog] = useState<StaffDialog>(null);

  const rows = useMemo(() => staffOnly(users.data ?? []), [users.data]);
  const visible = useMemo(() => filterStaff(rows, filters), [rows, filters]);
  const stats = useMemo(() => staffStats(rows), [rows]);

  function closeDialog() {
    setDialog(null);
    actions.clearFeedback();
  }

  function filter(patch: Partial<StaffFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    actions.clearFeedback();
  }

  function open(next: StaffDialog) {
    actions.clearFeedback();
    setDialog(next);
  }

  return (
    <div className="space-y-5">
      {users.data && <StaffSummary
        stats={stats}
        suspendedActive={filters.suspendedOnly}
        onToggleSuspended={() =>
          filter({ suspendedOnly: !filters.suspendedOnly })
        }
      />}

      <StaffFeedback
        error={actions.error}
        success={actions.success}
        onDismiss={actions.clearFeedback}
      />

      <StaffRegister
        state={users}
        rows={rows}
        visible={visible}
        filters={filters}
        currentUserId={me?.id ?? ''}
        isSuper={capability.isSuper}
        manageableRoles={capability.manageableRoles}
        creating={actions.creating}
        onFilter={filter}
        onClear={() => filter(resetFilters())}
        onCreate={() => open({ kind: 'create' })}
        onOpen={open}
      />

      {dialog?.kind === 'create' ? (
        <StaffCreateDialog
          creatableRoles={capability.creatableRoles}
          saving={actions.creating}
          onClose={closeDialog}
          onSubmit={(draft: StaffDraft) => actions.create(draft)}
        />
      ) : null}

      {dialog?.kind === 'profile' ? (
        <StaffManageDialog
          row={dialog.row}
          saving={actions.pendingId === dialog.row.id}
          onClose={closeDialog}
          onSave={actions.updateProfile}
        />
      ) : null}

      {dialog?.kind === 'role' ? (
        <StaffRoleDialog
          row={dialog.row}
          saving={actions.pendingId === dialog.row.id}
          onClose={closeDialog}
          onSave={actions.setRole}
        />
      ) : null}

      {dialog?.kind === 'password' ? (
        <StaffPasswordDialog
          row={dialog.row}
          saving={actions.pendingId === dialog.row.id}
          onClose={closeDialog}
          onSave={actions.resetPassword}
        />
      ) : null}
    </div>
  );
}