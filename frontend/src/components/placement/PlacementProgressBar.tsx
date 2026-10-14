import { FiClock } from 'react-icons/fi';
import type { SaveState } from './usePlacementRunner';
import { formatClock } from './utils';

type Props = { index: number; total: number; answered: number; saveState: SaveState; timeLeft: number | null };

/** Sticky status strip: position, answered count, autosave state and countdown. */
export function PlacementProgressBar({ index, total, answered, saveState, timeLeft }: Props) {
  const urgent = timeLeft !== null && timeLeft < 120;
  return (
    <div className="sticky top-0 z-10 space-y-2 rounded-box border border-base-300 bg-base-100 p-3">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold">Question {index + 1} of {total}</span>
        <span className={saveState === 'Not synced' ? 'text-error' : 'text-muted'} aria-live="polite">
          {answered} answered · {saveState}
        </span>
        {timeLeft !== null ? (
          <span role="timer" aria-label="Time left" className={`badge gap-1 font-semibold ${urgent ? 'badge-error' : 'badge-ghost'}`}>
            <FiClock aria-hidden />
            {formatClock(timeLeft)}
          </span>
        ) : null}
      </div>
      <progress className="progress progress-primary h-1.5 w-full" value={index + 1} max={total || 1} aria-label="Progress through the test" />
    </div>
  );
}
