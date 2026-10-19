import type { IntakeItem } from '../../lib/services';
import { isoDate } from '../../lib/services';
import { courseProgress,intakePhase } from './utils';

const DAY = 86_400_000;

function progressCaption(intake: IntakeItem): string {
  const now = Date.now();
  const start = new Date(intake.startDate).getTime();
  const end = new Date(intake.endDate).getTime();
  const phase = intakePhase(intake);
  if (phase === 'Upcoming') {
    const days = Math.ceil((start - now) / DAY);
    return `Starts in ${days} day${days === 1 ? '' : 's'}`;
  }
  if (phase === 'Ended') return 'Finished';
  const total = Math.max(Math.round((end - start) / DAY), 1);
  return `Day ${Math.min(Math.floor((now - start) / DAY) + 1, total)} of ${total}`;
}

/** Course dates on one solid rail, filled up to today. */
export function IntakeTimeline({ intake }: { intake: IntakeItem }) {
  const progress = courseProgress(intake);
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
        <span className="font-medium tabular-nums">
          {isoDate(intake.startDate)} – {isoDate(intake.endDate)}
        </span>
        <span className="text-muted">{progressCaption(intake)}</span>
      </div>
      <span className="relative block h-2.5 overflow-hidden rounded-full bg-base-300" aria-hidden>
        <span className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${progress}%` }} />
      </span>
    </div>
  );
}
