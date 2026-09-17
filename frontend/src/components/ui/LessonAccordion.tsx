import { FiChevronDown, FiChevronRight, FiLock } from 'react-icons/fi';
import type { LessonGroup } from '../../types';

type LessonAccordionProps = {
 group: LessonGroup;
 open: boolean;
 onToggle: () => void;
 className?: string;
};

/** Accordion row used by Course Contents and the Live Class content rail. */
export function LessonAccordion({ group, open, onToggle, className = '' }: LessonAccordionProps) {
 const counts = group.meta ? ` ${group.meta}` : '';

 return (
 <div className={`overflow-hidden rounded-field bg-base-200 ${className}`}>
 <button
 type="button"
 onClick={onToggle}
 aria-expanded={open}
 className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
 >
 <span className="text-sm font-medium">
 {group.title}
 {counts ? <span className="text-muted">{counts}</span> : null}
 </span>
 <span className="text-muted" aria-hidden>
 {open ? <FiChevronDown /> : <FiChevronRight />}
 </span>
 </button>
 {open ? (
 <ul className="space-y-1 px-2 pb-2">
 {group.items.map((item) => (
 <li key={item.id}>
 <div
 className={`flex items-center justify-between gap-3 rounded-field px-3 py-2 text-sm ${
 item.state === 'current' ? 'bg-base-100 text-ink' : 'text-muted'
 }`}
 >
 <span className="flex min-w-0 items-center gap-2">
 {item.state === 'locked' ? <FiLock className="shrink-0 text-muted" aria-hidden /> : null}
 <span className={`truncate ${item.state === 'current' ? 'font-medium' : ''}`}>{item.label}</span>
 </span>
 <span className="shrink-0 text-xs text-muted">{item.duration}</span>
 </div>
 </li>
 ))}
 </ul>
 ) : null}
 </div>
 );
}
