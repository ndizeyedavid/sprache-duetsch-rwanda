import { useEffect,useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { UserRow } from '../../lib/services';
import { Modal } from '../ui/Modal';
import { StaffField } from './StaffField';
import { ROLE_LABELS,STAFF_FIELD_CLASS,STAFF_SELECT_CLASS,STATUS_OPTIONS } from './constants';
import type { StaffProfilePatch } from './types';
import { initials,staffName,statusLabel,surfaceFor } from './utils';

type Props = {
  row: UserRow | null;
  saving: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    patch: StaffProfilePatch,
    message: string,
  ) => Promise<boolean>;
};

/** Identity plus account status — everything one `PATCH /users/:id` can change. */
export function StaffManageDialog({ row, saving, onClose, onSave }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const rowId = row?.id ?? null;

  useEffect(() => {
    if (!row) return;
    setFirstName(row.firstName);
    setLastName(row.lastName);
    setPhone(row.phone ?? '');
    setStatus(row.status);
  }, [rowId, row]);

  if (!row) return null;

  const statusOption = STATUS_OPTIONS.find((option) => option.value === status);
  const suspending = status === 'SUSPENDED' && row.status !== 'SUSPENDED';
  const nameError =
    !firstName.trim() || !lastName.trim() ? 'Both names are required.' : null;

  async function handleSave() {
    if (!row || nameError) return;
    const phoneValue = phone.trim();
    const patch: StaffProfilePatch = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      // An explicit null clears the column; omitting the key would leave it alone.
      phone: phoneValue === '' ? null : phoneValue,
    };
    if (status !== row.status) patch.status = status;
    const ok = await onSave(
      row.id,
      patch,
      suspending
        ? `${staffName(row)} suspended — sign-in is now refused.`
        : `${staffName(row)} updated — now ${statusLabel(status)}.`,
    );
    if (ok) onClose();
  }

  return (
    <Modal open onClose={onClose} title="Manage staff account">
      <div className="flex items-center gap-3 rounded-field border border-line bg-base-100 px-4 py-3">
        <span
          aria-hidden
          className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold ${surfaceFor(row.status)}`}
        >
          {initials(row)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{staffName(row)}</p>
          <p className="truncate text-[11px] text-muted">
            {ROLE_LABELS[row.role]} · {row.email}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StaffField id="manage-first" label="First name" error={nameError}>
          <input
            id="manage-first"
            value={firstName}
            onChange={(event) => setFirstName(event.currentTarget.value)}
            className={STAFF_FIELD_CLASS}
          />
        </StaffField>
        <StaffField id="manage-last" label="Last name" error={nameError}>
          <input
            id="manage-last"
            value={lastName}
            onChange={(event) => setLastName(event.currentTarget.value)}
            className={STAFF_FIELD_CLASS}
          />
        </StaffField>
      </div>

      <div className="mt-4 space-y-4">
        <StaffField
          id="manage-phone"
          label="Phone"
          hint="Clear the field and save to remove the number."
        >
          <input
            id="manage-phone"
            value={phone}
            onChange={(event) => setPhone(event.currentTarget.value)}
            className={STAFF_FIELD_CLASS}
          />
        </StaffField>
        <StaffField id="manage-status" label="Status" hint={statusOption?.hint}>
          <select
            id="manage-status"
            value={status}
            onChange={(event) => setStatus(event.currentTarget.value)}
            className={STAFF_SELECT_CLASS}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </StaffField>
      </div>

      {suspending ? (
        <p className="mt-4 flex items-start gap-2 rounded-field bg-coral text-error-content px-3 py-2 text-[11px] font-medium text-[#D8482F]">
          <FiAlertTriangle aria-hidden className="mt-0.5 shrink-0" />
          <span>
            {staffName(row)} will not be able to sign in. Classes, grades and audit history stay
            intact — reactivate the account at any time.
          </span>
        </p>
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
          disabled={saving || Boolean(nameError)}
          className={`btn rounded-full border-0 text-white hover:bg-night disabled:bg-base-300 disabled:text-muted ${
            suspending ? 'bg-coral' : 'bg-brand'
          }`}
        >
          {saving ? <span className="loading loading-spinner loading-sm" /> : null}
          {suspending ? 'Suspend account' : 'Save changes'}
        </button>
      </div>
    </Modal>
  );
}