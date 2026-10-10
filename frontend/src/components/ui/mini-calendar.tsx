import {
addMonths,
format,
isSameMonth,
subMonths
} from "date-fns";
import { useState } from "react";
import { FiChevronLeft,FiChevronRight } from "react-icons/fi";
import type { MiniCalendarProps } from './mini-calendar-props';
import { monthGrid } from './month-grid';
import { WEEKDAYS } from './weekdays';
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
 ? "text-muted"
 : isSelected
 ? "bg-brand font-semibold text-white"
 : isMarked
 ? "bg-brand text-primary-content font-semibold text-brand"
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
