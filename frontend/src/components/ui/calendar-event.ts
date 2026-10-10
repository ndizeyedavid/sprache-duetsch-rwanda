import type { Tone } from "../../types";
export type CalendarEvent = {
 day: number;
 label: string;
 tone: Tone;
 time?: string;
};
