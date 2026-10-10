import { useEffect,useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { UserRow } from '../../lib/services';
import { Modal } from '../ui/Modal';
import { ROLE_OPTIONS,STAFF_SELECT_CLASS } from './constants';
import { staffName } from './utils';

type Props = {
  row: UserRow | null;
  saving: boolean;
  onClose: () => void;
  onSave: (id: string, role: string, message: string) => Promise<boolean>;
};

/**
 * Role change is the most consequential write on this page — the API restricts it to
 * super admins and audits it, so the dialog states both scopes before you commit.
 */
export function StaffRoleDialog({ row, saving, onClose, onSave }: Props) {
  const [role, setRole] = useState('TEACHER');

  const rowId = row?.id ?? null;

  useEffect(() => {
    if (row) setRole(row.role);
  }, [rowId, row]);

  if (!row) return null;

  const next = ROLE_OPTIONS.find((option) => option.value === role);
  const currentOption = ROLE_OPTIONS.find((option) => option.value === row.role);
  const losingRole = row.role !== role;

  async function handleSave() {
    if (!row || !losingRole) return;
    const ok = await onSave(
      row.id,
      role,
      `${staffName(row)} is now ${next?.label ?? role}. Their menu and access change on their next request.`,
    );
    if (ok) onClose();
  }

  return (
    <Modal open onClose={onClose} title="Change role">
      <p className="rounded-field bg-base-200 px-4 py-3 text-xs text-muted">
        <strong className="text-ink">{staffName(row)}</strong> is currently{' '}
        <strong className="text-ink">{currentOption?.label ?? row.role}</strong>.
      </p>

      <div className="mt-4">
        <label htmlFor="role-select" className="block">
          <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-ink uppercase">
            New role
          </span>
          <select
            id="role-select"
            value={role}
            onChange={(event) => setRole(event.currentTarget.value)}
            disabled={saving}
            className={STAFF_SELECT_CLASS}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {next ? (
        <div className="mt-4 space-y-2 rounded-field border border-line bg-base-100 px-4 py-3 text-[11px]">
          <p className="text-ink">
            <strong>Can do:</strong> {next.scope}
          </p>
          <p className="text-muted">{next.limits}</p>
          <p className="flex items-start gap-2 border-t border-line pt-2 text-muted">
            <FiAlertTriangle aria-hidden className="mt-0.5 shrink-0 text-brand" />
            <span>
              Recorded in the audit log with your name. Anything the old role could reach, the new
              role cannot.
            </span>
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="btn rounded-full border-line bg-base-100 text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !losingRole}
          className="btn rounded-full border-0 bg-brand text-white hover:bg-night disabled:bg-base-300 disabled:text-muted"
        >
          {saving ? <span className="loading loading-spinner loading-sm" /> : null}
          Change role
        </button>
      </div>
    </Modal>
  );
}