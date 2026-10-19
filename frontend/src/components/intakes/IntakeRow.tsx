import { FiArchive,FiEdit2,FiRotateCcw } from 'react-icons/fi';
import type { IntakeItem } from '../../lib/services';
import { StatusBadge } from '../ui/StatusBadge';
import { QUIET_BTN } from './constants';
import { IntakeTimeline } from './IntakeTimeline';
import { RegistrationSwitch } from './RegistrationSwitch';
import { intakePhase } from './utils';

type IntakeRowProps = {
  intake: IntakeItem;
  onEdit: (intake: IntakeItem) => void;
  onArchive: (intake: IntakeItem) => void;
  onRestore: (intake: IntakeItem) => void;
  onToggleRegistration: (intake: IntakeItem, open: boolean) => void;
  busyId: string | null;
  toggling: boolean;
};

export function IntakeRow({ intake, onEdit, onArchive, onRestore, onToggleRegistration, busyId, toggling }: IntakeRowProps) {
  const busy = busyId === intake.id;
  const spinner = <span className="loading loading-spinner loading-xs" />;

  return (
    <li className="rounded-field border border-line bg-base-100 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold">{intake.name}</p>
            <StatusBadge status={intake.isActive ? intakePhase(intake) : 'Archived'} />
          </div>
          <p className="mt-0.5 font-mono text-[0.6875rem] tracking-wide text-muted">{intake.code}</p>
        </div>
        <RegistrationSwitch intake={intake} busy={toggling} onToggle={onToggleRegistration} />
      </div>

      <div className="mt-4">
        <IntakeTimeline intake={intake} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <div className="flex flex-wrap gap-2">{intake.levels?.map(level => <span className="badge badge-soft" key={level.id}>{level.code}</span>)}</div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onEdit(intake)} className={`${QUIET_BTN} btn-ghost`}>
            <FiEdit2 aria-hidden /> Edit
          </button>
          {intake.isActive ? (
            <button type="button" disabled={busy} onClick={() => onArchive(intake)} className="btn btn-sm gap-1 rounded-full text-error">
              {busy ? spinner : <FiArchive aria-hidden />}
              Archive
            </button>
          ) : (
            <button type="button" disabled={busy} onClick={() => onRestore(intake)} className={`${QUIET_BTN} border-line`}>
              {busy ? spinner : <FiRotateCcw aria-hidden />}
              Restore
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
