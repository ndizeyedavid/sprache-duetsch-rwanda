import { format } from 'date-fns';
import { FiArrowRight } from 'react-icons/fi';

type Props = { sessions: { startAt: string; title: string; status: string }[]; after: Date; onJump: (day: Date) => void };

/** "Next class: Tue 20 Oct · 18:00" — one tap to the next scheduled class beyond what's on screen. */
export function NextClassJump({ sessions, after, onJump }: Props) {
  const next = sessions
    .filter((s) => s.status !== 'CANCELLED' && new Date(s.startAt) > after)
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))[0];
  if (!next) return null;
  const start = new Date(next.startAt);
  return (
    <button type="button" onClick={() => onJump(start)} className="btn btn-ghost btn-xs h-auto min-h-6 max-w-full gap-1 whitespace-normal rounded-full py-1 text-left text-primary">
      Next class: {format(start, 'EEE d MMM · HH:mm')} — {next.title} <FiArrowRight aria-hidden />
    </button>
  );
}
