import { useState } from 'react';
import type { IntakeItem } from '../../lib/services';
import { Modal } from '../ui/Modal';
import { DANGER_BTN } from './constants';

type IntakeConfirmDialogProps = {
  intake: IntakeItem | null;
  onCancel: () => void;
  onConfirm: (intake: IntakeItem) => Promise<void>;
};

/** Destructive confirm: archiving is reversible but hides the intake from intake pickers. */
export function IntakeConfirmDialog({ intake, onCancel, onConfirm }: IntakeConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!intake) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm(intake);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not archive the intake.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={Boolean(intake)} onClose={onCancel} title="Archive this intake?">
      {intake ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{intake.name}</span> will be marked
            inactive. It stays on record, but can no longer be picked for new
            enrolments, classes or sessions. You can restore it later.
          </p>
          {error ? <p role="alert" className="text-xs font-medium text-error">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="btn btn-sm btn-ghost rounded-full">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy}
              className={DANGER_BTN}
            >
              {busy ? <span className="loading loading-spinner loading-xs" /> : null}
              Archive intake
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
