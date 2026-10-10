import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { UserRow } from '../../lib/services';
import { Modal } from '../ui/Modal';
import { StaffHandover } from './StaffHandover';
import { StaffPasswordInput } from './StaffPasswordInput';
import { passwordProblem,staffName } from './utils';

type Props = {
  row: UserRow | null;
  saving: boolean;
  onClose: () => void;
  onSave: (id: string, password: string, message: string) => Promise<boolean>;
};

/**
 * Reset revokes every refresh token server-side, so the old password stops working
 * immediately and everywhere. The dialog keeps the new password visible for handover.
 */
export function StaffPasswordDialog({ row, saving, onClose, onSave }: Props) {
  const [password, setPassword] = useState('');
  const [issued, setIssued] = useState<string | null>(null);

  if (!row) return null;

  const check = passwordProblem(password);

  async function handleSave() {
    if (!row || !check.valid) return;
    const ok = await onSave(
      row.id,
      password,
      `Password reset for ${staffName(row)} — every existing session was signed out.`,
    );
    if (ok) {
      setIssued(password);
      setPassword('');
    }
  }

  function close() {
    setPassword('');
    setIssued(null);
    onClose();
  }

  return (
    <Modal open onClose={close} title={issued ? 'Password reset' : 'Reset password'}>
      {issued ? (
        <StaffHandover
          email={`${row.firstName} ${row.lastName} · ${row.email}`}
          password={issued}
          nextStep="They are signed out everywhere and must use this password to sign back in."
          onDone={close}
        />
      ) : (
        <div>
          <p className="rounded-field bg-base-200 px-4 py-3 text-xs text-muted">
            Setting a new password for{' '}
            <strong className="text-ink">
              {row.firstName} {row.lastName}
            </strong>{' '}
            ({row.email}).
          </p>

          <div className="mt-4">
            <StaffPasswordInput
              id="reset-password"
              label="New temporary password"
              value={password}
              onChange={setPassword}
              error={password.length > 0 ? check.error : null}
            />
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-field bg-coral text-error-content px-3 py-2 text-[11px] font-medium text-[#D8482F]">
            <FiAlertTriangle aria-hidden className="mt-0.5 shrink-0" />
            <span>
              Every active session is revoked at once. Anyone using the old password is signed out
              immediately and must use the new one.
            </span>
          </p>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="btn rounded-full border-line bg-base-100 text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !check.valid}
              className="btn rounded-full border-0 bg-brand text-white hover:bg-night disabled:bg-base-300 disabled:text-muted"
            >
              {saving ? <span className="loading loading-spinner loading-sm" /> : null}
              Reset password
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}