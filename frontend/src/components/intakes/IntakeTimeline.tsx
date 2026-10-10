import type { IntakeItem } from '../../lib/services';
import { isoDate } from '../../lib/services';
import type { TimelineScale } from './utils';
import { timelineScale,windowSpan } from './utils';

type Span = { left: number; width: number } | null;

type RailProps = {
  label: string;
  span: Span;
  scale: TimelineScale;
  /** Solid fill token, applied to the whole bar. */
  fill: string;
  caption: string;
};

function Rail({ label, span, scale, fill, caption }: RailProps) {
  const today =
    scale.today === null
      ? null
      : ((scale.today - scale.origin) / scale.size) * 100;

  return (
    <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3 sm:grid-cols-[6rem_1fr]">
      <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
        {label}
      </span>
      <span className="flex items-center gap-2">
        <span className="relative block h-2.5 grow overflow-hidden rounded-full bg-base-300">
          {span ? (
            <span
              className={`absolute inset-y-0 rounded-full ${fill}`}
              style={{ left: `${span.left}%`, width: `${span.width}%` }}
            />
          ) : null}
          {today !== null ? (
            <span
              className="absolute inset-y-0 w-0.5 rounded-full bg-night"
              style={{ left: `${today}%` }}
            />
          ) : null}
        </span>
        <span className="w-32 shrink-0 text-right text-[11px] text-muted tabular-nums sm:w-40">
          {caption}
        </span>
      </span>
    </div>
  );
}

/**
 * The signature element: both windows on one shared scale with a solid "today"
 * tick, so an admin sees at a glance whether an intake has started and whether
 * registration is still open.
 */
export function IntakeTimeline({ intake }: { intake: IntakeItem }) {
  const scale = timelineScale(intake);
  const hasEnrolment = Boolean(intake.enrollmentOpensAt && intake.enrollmentEndsAt);

  return (
    <div className="space-y-2">
      <Rail
        label="Course"
        fill="bg-brand"
        scale={scale}
        span={windowSpan(intake.startDate, intake.endDate, scale.origin, scale.size)}
        caption={`${isoDate(intake.startDate)} – ${isoDate(intake.endDate)}`}
      />
      <Rail
        label="Enrolment"
        fill="bg-sun"
        scale={scale}
        span={windowSpan(
          intake.enrollmentOpensAt,
          intake.enrollmentEndsAt,
          scale.origin,
          scale.size,
        )}
        caption={
          hasEnrolment
            ? `${isoDate(intake.enrollmentOpensAt)} – ${isoDate(intake.enrollmentEndsAt)}`
            : 'Not set'
        }
      />
    </div>
  );
}
