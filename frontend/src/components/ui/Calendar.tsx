import { useState } from "react";
import type { ReactNode } from "react";
import {
 addMonths,
 eachDayOfInterval,
 endOfMonth,
 endOfWeek,
 format,
 isSameMonth,
 startOfMonth,
 startOfWeek,
 subMonths,
} from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TONE_CLASSES } from "../../lib/theme";
import type { Tone } from "../../types";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function monthGrid(month: Date): Date[] {
 return eachDayOfInterval({
 start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
 end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
 });
}

type MiniCalendarProps = {
 month?: Date;
 /** Day-of-month numbers that get a marker dot. */
 marked?: number[];
 selected?: number;
 onSelect?: (day: number) => void;
 className?: string;
};

export function MiniCalendar({
 month: initialMonth,
 marked = [],
 selected,
 onSelect,
 className = "",
}: MiniCalendarProps) {
 const [month, setMonth] = useState(
 () => initialMonth ?? new Date(2025, 0, 1),
 );
 const days = monthGrid(month);

 return (
 <div className={className}>
 <div className="mb-4 flex items-center justify-between">
 <p className="text-sm font-semibold">{format(month, "MMMM yyyy")}</p>
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
 <div className="grid grid-cols-7 gap-y-1 text-center">
 {WEEKDAYS.map((day, index) => (
 <span
 key={`${day}-${index}`}
 className="pb-2 text-[11px] font-medium text-muted"
 >
 {day}
 </span>
 ))}
 {days.map((day) => {
 const inMonth = isSameMonth(day, month);
 const dayNumber = day.getDate();
 const isSelected = inMonth && dayNumber === selected;
 const isMarked = inMonth && marked.includes(dayNumber);

 return (
 <button
 key={day.toISOString()}
 type="button"
 disabled={!inMonth}
 aria-label={format(day, "d MMMM yyyy")}
 aria-pressed={isSelected}
 onClick={() => onSelect?.(dayNumber)}
 className={`relative mx-auto flex size-8 items-center justify-center rounded-full text-xs transition-colors ${
 !inMonth
 ? "text-muted/30"
 : isSelected
 ? "bg-brand font-semibold text-white"
 : isMarked
 ? "bg-brand-tint font-semibold text-brand"
 : "text-ink hover:bg-base-300"
 }`}
 >
 {dayNumber}
 {isMarked && !isSelected ? (
 <span className="absolute bottom-1 size-1 rounded-full bg-brand" />
 ) : null}
 </button>
 );
 })}
 </div>
 </div>
 );
}

export type CalendarEvent = {
 day: number;
 label: string;
 tone: Tone;
 time?: string;
};

type MonthCalendarProps = {
 month?: Date;
 events?: CalendarEvent[];
 /** Slot for the "+ New Schedule" style action in the month header. */
 action?: ReactNode;
 className?: string;
};

/** Admin month view — event chips sit inside each day cell. */
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
 className={`text-[11px] font-medium ${inMonth ? "text-ink" : "text-muted/30"}`}
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

type DateTileProps = {
 day: string;
 month: string;
 tone?: Tone;
 className?: string;
};

/** Compact day/month square used by upcoming-schedule cards. */
export function DateTile({
 day,
 month,
 tone = "brand",
 className = "",
}: DateTileProps) {
 const tones = TONE_CLASSES[tone];

 return (
 <div
 className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-xl ${tones.soft} ${tones.text} ${className}`}
 >
 <span className="text-sm font-semibold leading-none">{day}</span>
 <span className="mt-0.5 text-[10px] uppercase tracking-wide">
 {month}
 </span>
 </div>
 );
}
