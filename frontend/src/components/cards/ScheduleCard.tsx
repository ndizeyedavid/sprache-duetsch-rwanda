import { TONE_CLASSES } from '../../lib/theme';
import type { LiveClassStatus, Tone } from '../../types';

type ScheduleCardProps = {
  title: string;
  teacher: string;
  photo: string;
  date: string;
  time: string;
  tone: Tone;
  status?: LiveClassStatus;
  className?: string;
};

/** Colour-accented class card used in every schedule list in the mockup. */
export function ScheduleCard({
  title,
  teacher,
  photo,
  date,
  time,
  tone,
  status,
  className = '',
}: ScheduleCardProps) {
  const tones = TONE_CLASSES[tone];

  return (
    <article
      className={`card-shadow overflow-hidden rounded-box border-l-4 bg-base-100 p-4 ${tones.text} ${className}`}
      style={{ borderLeftColor: tones.hex }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {status ? (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${tones.soft}`}>
            {status}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <img src={photo} alt={teacher} loading="lazy" className="size-7 rounded-full object-cover" />
        <span className="truncate text-xs text-muted">{teacher}</span>
      </div>
      <p className="mt-2 text-xs font-medium text-ink">
        {date} <span className="text-muted">· {time}</span>
      </p>
    </article>
  );
}
