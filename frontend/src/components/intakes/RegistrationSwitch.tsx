import { FiLock,FiUnlock } from 'react-icons/fi';
import type { IntakeItem } from '../../lib/services';
import { isoDate } from '../../lib/services';
import { isRegistrationOpen } from './utils';

type Props = { intake: IntakeItem; busy: boolean; onToggle: (intake: IntakeItem, open: boolean) => void };

/** One-click registration switch: open lets students register until the intake ends. */
export function RegistrationSwitch({ intake, busy, onToggle }: Props) {
  const ended = new Date(intake.endDate).getTime() < Date.now();
  if (!intake.isActive || ended) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-base-200 px-3 py-1.5 text-xs font-medium text-muted">
        <FiLock aria-hidden /> {intake.isActive ? 'Ended — registration closed' : 'Archived — registration off'}
      </span>
    );
  }
  const open = isRegistrationOpen(intake);
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-3 rounded-full border px-3 py-1.5 transition-colors ${
        open ? 'border-success bg-success/10' : 'border-line bg-base-200'
      }`}
    >
      <input
        type="checkbox"
        role="switch"
        checked={open}
        disabled={busy}
        aria-label={`Registration for ${intake.name}`}
        onChange={(event) => onToggle(intake, event.currentTarget.checked)}
        className="toggle toggle-success toggle-sm"
      />
      <span className="text-xs leading-tight">
        <span className="flex items-center gap-1 font-semibold">
          {busy ? <span className="loading loading-spinner loading-xs" /> : open ? <FiUnlock aria-hidden /> : <FiLock aria-hidden />}
          {open ? 'Registration open' : 'Registration closed'}
        </span>
        <span className="block text-[0.6875rem] text-muted">
          {open ? `Students can register until ${isoDate(intake.endDate)}` : 'Click to open for students'}
        </span>
      </span>
    </label>
  );
}
