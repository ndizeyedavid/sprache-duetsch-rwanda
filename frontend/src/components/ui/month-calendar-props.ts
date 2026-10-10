import type { ReactNode } from "react";
import type { CalendarEvent } from './calendar-event';
export type MonthCalendarProps = {
 month?: Date;
 events?: CalendarEvent[];
 /** Slot for the "+ New Schedule" style action in the month header. */
 action?: ReactNode;
 className?: string;
};
