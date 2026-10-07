import { useFinanceAccess } from '../../hooks/useFinanceAccess';
import { FiArchive,FiEdit2,FiRotateCcw } from 'react-icons/fi';
import { rwf } from '../../lib/format';
import type { IntakeItem } from '../../lib/services';
import { money } from '../../lib/services';
import { StatusBadge } from '../ui/StatusBadge';
import { QUIET_BTN } from './constants';
import { IntakeTimeline } from './IntakeTimeline';
import { intakePhase } from './utils';

type IntakeRowProps = {
  intake: IntakeItem;
  onEdit: (intake: IntakeItem) => void;
  onArchive: (intake: IntakeItem) => void;
  onRestore: (intake: IntakeItem) => void;
  busyId: string | null;
};

export function IntakeRow({ intake, onEdit, onArchive, onRestore, busyId }: IntakeRowProps) {
  const canFinance = useFinanceAccess();
  const phase = intakePhase(intake);
  const busy = busyId === intake.id;

  return (
    <li className="rounded-field border border-line bg-base-100 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{intake.name}</p>
          <p className="mt-0.5 font-mono text-[11px] tracking-wide text-muted">{intake.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={intake.isActive ? phase : 'Inactive'} />
        </div>
      </div>

      <div className="mt-4">
        <IntakeTimeline intake={intake} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        {canFinance && <><dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-muted">
          <div className="flex items-baseline gap-1.5">
            <dt>Registration</dt>
            <dd className="font-semibold text-ink tabular-nums">
              {rwf(money(intake.registrationFee))}
            </dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt>Books</dt>
            <dd className="font-semibold text-ink tabular-nums">
              {rwf(money(intake.bookFee))}
            </dd>
          </div>
          <dd className="text-[11px]">{intake.currency}</dd>
        </dl></>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(intake)}
            className={`${QUIET_BTN} btn-ghost`}
          >
            <FiEdit2 aria-hidden /> Edit
          </button>
          {intake.isActive ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onArchive(intake)}
              className="btn btn-sm gap-1 rounded-full text-error"
            >
              {busy ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <FiArchive aria-hidden />
              )}
              Archive
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => onRestore(intake)}
              className={`${QUIET_BTN} border-line`}
            >
              {busy ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <FiRotateCcw aria-hidden />
              )}
              Restore
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
