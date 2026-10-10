import {
addMonths,
format,
isSameMonth,
subMonths
} from "date-fns";
import { useState } from "react";
import { FiChevronLeft,FiChevronRight } from "react-icons/fi";
import { TONE_CLASSES } from "../../lib/theme";
import type { MonthCalendarProps } from './month-calendar-props';
import { monthGrid } from './month-grid';
import { WEEKDAYS } from './weekdays';
export function MonthCalendar({
 month: initialMonth,
 events = [],
 action,
 className = "",
}: MonthCalendarProps) {
 const [month, setMonth] = useState(
 () => initialMonth ?? new Date(2025, 0, 1),
 );
 const days = monthGrid(month);

 return (
 <div className={className}>
 <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-2">
 <p className="text-sm font-semibold">{format(month, "MMMM, yyyy")}</p>
 <div className="flex items-center gap-1">
 <button
 type="button"
 className="btn btn-ghost btn-xs btn-circle text-muted"
 aria-label="Previous month"
 onClick={() => setMonth((current) => subMonths(current, 1))}
 >
 <FiChevronLeft aria-hidden />
 </button>
 <button
 type="button"
 className="btn btn-ghost btn-xs btn-circle text-muted"
 aria-label="Next month"
 onClick={() => setMonth((current) => addMonths(current, 1))}
 >
 <FiChevronRight aria-hidden />
 </button>
 </div>
 </div>
 {action}
 </div>
 <div className="grid grid-cols-7 gap-2 text-center">
 {WEEKDAYS.map((day, index) => (
 <span
 key={`${day}-${index}`}
 className="text-[11px] font-medium text-muted"
 >
 {day}
 </span>
 ))}
 {days.map((day) => {
 const inMonth = isSameMonth(day, month);
 const dayEvents = inMonth
 ? events.filter((event) => event.day === day.getDate())
 : [];

 return (
 <div
 key={day.toISOString()}
 className={`min-h-20 rounded-field p-1.5 text-left ${
 inMonth ? "bg-base-200" : "bg-transparent"
 }`}
 >
 <span
 className={`text-[11px] font-medium ${inMonth ? "text-ink" : "text-muted"}`}
 >
 {day.getDate()}
 </span>
 <div className="mt-1 space-y-1">
 {dayEvents.slice(0, 2).map((event) => (
 <span
 key={event.label}
 className={`block truncate rounded-md px-1.5 py-1 text-[10px] font-medium ${TONE_CLASSES[event.tone].soft} ${TONE_CLASSES[event.tone].text}`}
 >
 <span className="block truncate font-semibold">
 {event.label}
 </span>
 {event.time ? (
 <span className="block text-[9px] opacity-80">
 {event.time}
 </span>
 ) : null}
 </span>
 ))}
 {dayEvents.length > 2 ? (
 <span className="block text-[10px] text-muted">
 +{dayEvents.length - 2} more
 </span>
 ) : null}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
