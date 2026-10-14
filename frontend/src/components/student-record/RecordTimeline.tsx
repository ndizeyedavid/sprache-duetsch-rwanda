import { FiClock } from 'react-icons/fi';
import type { StudentDetail } from '../../lib/services/student-detail';
import { TONE_CLASSES } from '../../lib/theme';
import { Panel } from '../ui/Panel';
import { recordTimeline } from './timeline';
import { shortDate } from './utils';

export function RecordTimeline({ student }: { student: StudentDetail }) {
  const events = recordTimeline(student);
  return (
    <Panel>
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <FiClock aria-hidden className="text-brand" />Milestones
      </h2>
      <ol className="mt-4 space-y-4 border-l-2 border-line pl-5">
        {events.map((event) => (
          <li key={event.key} className="relative">
            <span aria-hidden className={`absolute -left-[27px] top-1 size-3 rounded-full border-2 border-base-100 ${TONE_CLASSES[event.tone].bg}`} />
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-sm font-medium">{event.title}</p>
              <time dateTime={event.at} className="text-xs text-muted tabular-nums">{shortDate(event.at)}</time>
            </div>
            <p className="text-xs text-muted">{event.detail}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
