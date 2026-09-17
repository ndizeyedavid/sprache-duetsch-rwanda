import { Link } from 'react-router-dom';
import { FiAlertCircle, FiCheckSquare, FiClock } from 'react-icons/fi';
import { Panel, SectionHeader } from '../ui/Panel';
import { EmptyBlock } from '../common/PageState';
import { humanize, isoDate, isoTime } from '../../lib/services';
import type { SessionItem } from '../../lib/services';

const TONE_BG: Record<string, string> = {
 brand: 'bg-brand',
 sun: 'bg-sun',
 coral: 'bg-coral',
 navy: 'bg-night',
};

type TodoItem = {
 id: string;
 label: string;
 hint: string;
 to: string;
 tone: 'brand' | 'sun' | 'coral' | 'navy';
};

type TodoRailProps = {
 todos: TodoItem[];
 needsGrading: { classGroupId: string; className: string; count: number }[];
 upcoming: SessionItem[];
 onClassGroupClick?: (classGroupId: string) => void;
};

export function TodoRail({ todos, needsGrading, upcoming, onClassGroupClick }: TodoRailProps) {
 return (
 <div className="space-y-5">
 <Panel>
 <SectionHeader title="To-Do" />
 {todos.length === 0 ? (
 <EmptyBlock title="All caught up" hint="No grading or attendance needs attention right now." />
 ) : (
 <ul className="space-y-2">
 {todos.slice(0, 5).map((item) => (
 <li key={item.id}>
 <Link
 to={item.to}
 className="flex items-center gap-3 rounded-field bg-base-200 px-3 py-2 hover:bg-brand-tint"
 >
 <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-white ${TONE_BG[item.tone] ?? 'bg-brand'}`}>
 {item.tone === 'brand' ? <FiCheckSquare aria-hidden /> : item.tone === 'sun' ? <FiAlertCircle aria-hidden /> : <FiClock aria-hidden />}
 </span>
 <span className="min-w-0">
 <span className="block truncate text-xs font-semibold">{item.label}</span>
 <span className="block truncate text-[11px] text-muted">{item.hint}</span>
 </span>
 </Link>
 </li>
 ))}
 </ul>
 )}
 </Panel>

 <Panel>
 <SectionHeader title="Needs Grading" action={{ label: 'Gradebook', to: '/teacher/grading' }} />
 {needsGrading.length === 0 ? (
 <EmptyBlock title="Nothing to grade" hint="Submissions appear here once students turn in work." />
 ) : (
 <ul className="space-y-2">
 {needsGrading.map((row) => (
 <li key={row.classGroupId}>
 <button
 type="button"
 onClick={() => onClassGroupClick?.(row.classGroupId)}
 className="flex w-full items-center justify-between gap-2 rounded-field bg-base-200 px-3 py-2 text-left hover:bg-brand-tint"
 >
 <span className="truncate text-xs font-medium">{row.className}</span>
 <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">{row.count}</span>
 </button>
 </li>
 ))}
 </ul>
 )}
 </Panel>

 <Panel>
 <SectionHeader title="Coming Up" action={{ label: 'Schedule', to: '/teacher/schedule' }} />
 {upcoming.length === 0 ? (
 <EmptyBlock title="No upcoming sessions" hint="Live classes you schedule appear here." />
 ) : (
 <ul className="space-y-2">
 {upcoming.slice(0, 3).map((session) => (
 <li key={session.id} className="rounded-field bg-base-200 px-3 py-2 text-xs">
 <p className="font-semibold leading-snug">{session.title}</p>
 <p className="mt-0.5 text-muted">
 {session.classGroup?.name ?? '—'} · {isoDate(session.startAt)} {isoTime(session.startAt)}
 </p>
 <p className="text-[11px] text-muted">{humanize(session.status)}</p>
 </li>
 ))}
 </ul>
 )}
 </Panel>
 </div>
 );
}
