/** Pixel height of one hour row; 30-minute classes stay readable at 28px. */
export const HOUR_HEIGHT = 56;
export const AXIS_WIDTH = 60;
/** The school day the grid shows: 08:00–22:00. Classes outside it are pinned to the edge. */
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 22;
export const DAY_START_MIN = DAY_START_HOUR * 60;
export const DAY_END_MIN = DAY_END_HOUR * 60;
/** Hour lines/labels from 08:00 to 22:00 inclusive. */
export const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);
export const GRID_HEIGHT = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;
/** Pixel offset of a minute-of-day inside the visible window. */
export const minuteToY = (minutes: number) => ((minutes - DAY_START_MIN) / 60) * HOUR_HEIGHT;
/** Clicking an empty slot snaps to this many minutes. */
export const SLOT_MINUTES = 30;

/** Session blocks by status — solid fills, readable in light and dark themes. */
export const STATUS_BLOCK: Record<string, string> = {
  SCHEDULED: 'bg-brand-soft text-brand-soft-ink border-primary',
  LIVE: 'bg-primary text-primary-content border-primary',
  COMPLETED: 'bg-night-soft text-night-soft-ink border-[var(--color-night)]',
  RESCHEDULED: 'bg-sun text-[#8A6800] border-warning',
  CANCELLED: 'bg-muted-soft text-muted-ink border-base-300 line-through decoration-1',
};
