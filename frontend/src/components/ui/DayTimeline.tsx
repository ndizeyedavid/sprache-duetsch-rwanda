import { FiMoreHorizontal } from "react-icons/fi";
import { AvatarGroup } from "./AvatarGroup";
import { TONE_CLASSES } from "../../lib/theme";
import type { Tone } from "../../types";

export type DayTimelineEvent = {
 id: string;
 title: string;
 subtitle: string;
 time: string;
 tone: Tone;
 attendees: string[];
};

const START_HOUR = 7;
const END_HOUR = 17;
const ROW_HEIGHT = 72;

function startHour(time: string): number {
 const parsed = Number.parseInt(time.slice(0, 2), 10);
 return Number.isNaN(parsed)
 ? START_HOUR
 : Math.min(Math.max(parsed, START_HOUR), END_HOUR);
}

type DayTimelineProps = {
 events: DayTimelineEvent[];
 className?: string;
};

/** Hour rail with floating class cards — the "Today Schedule" view. */
export function DayTimeline({ events, className = "" }: DayTimelineProps) {
 const hours = Array.from(
 { length: END_HOUR - START_HOUR + 1 },
 (_, index) => START_HOUR + index,
 );

 return (
 <div
 className={`relative ${className}`}
 style={{ height: (END_HOUR - START_HOUR + 1) * ROW_HEIGHT }}
 >
 {hours.map((hour) => (
 <div
 key={hour}
 className="absolute inset-x-0"
 style={{ top: (hour - START_HOUR) * ROW_HEIGHT }}
 >
 <span className="absolute left-0 top-0 w-14 text-[11px] text-muted">
 {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? "AM" : "PM"}
 </span>
 <span
 className="absolute left-16 right-0 border-t border-dashed border-line"
 aria-hidden
 />
 </div>
 ))}

 {events.map((event, index) => {
 const top = (startHour(event.time) - START_HOUR) * ROW_HEIGHT + 8;
 const tones = TONE_CLASSES[event.tone];

 return (
 <article
 key={event.id}
 className=" absolute rounded-field border-l-4 bg-base-100 p-3"
 style={{
 top,
 left: 72 + (index % 3) * 56,
 width: "min(19rem, calc(100% - 5rem))",
 borderLeftColor: tones.hex,
 }}
 >
 <div className="flex items-start justify-between gap-2">
 <span className="min-w-0">
 <span className="block truncate text-xs font-semibold">
 {event.title}
 </span>
 <span className="block truncate text-[10px] text-muted">
 {event.subtitle}
 </span>
 </span>
 <FiMoreHorizontal className="shrink-0 text-muted" aria-hidden />
 </div>
 <div className="mt-2 flex items-center justify-between gap-2">
 <span className="text-[10px] font-medium text-muted">
 {event.time}
 </span>
 <AvatarGroup
 items={event.attendees.map((src, attendeeIndex) => ({
 src,
 alt: `${event.title} attendee ${attendeeIndex + 1}`,
 }))}
 size="sm"
 />
 </div>
 </article>
 );
 })}
 </div>
 );
}
