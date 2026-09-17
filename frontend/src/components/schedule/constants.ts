import { FiVideo, FiMapPin, FiLayers, FiCalendar } from 'react-icons/fi';

export const VIEWS = ['agenda', 'week', 'month'] as const;
export type ScheduleView = (typeof VIEWS)[number];

export const VIEW_LABEL: Record<ScheduleView, string> = {
  agenda: 'Agenda',
  week: 'Week',
  month: 'Month',
};

export const MODE_OPTIONS = [
  { value: 'ONLINE', label: 'Online', hint: 'Google Meet / Zoom', icon: FiVideo },
  { value: 'ONSITE', label: 'On site', hint: 'Classroom', icon: FiMapPin },
  { value: 'HYBRID', label: 'Hybrid', hint: 'Both', icon: FiLayers },
] as const;

export const PROVIDER_OPTIONS = [
  { value: 'GOOGLE_MEET', label: 'Google Meet' },
  { value: 'ZOOM', label: 'Zoom' },
  { value: 'MICROSOFT_TEAMS', label: 'Teams' },
  { value: 'OTHER', label: 'Other link' },
] as const;

export const STATUS_OPTIONS = ['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'] as const;

export const TONE_BY_STATUS: Record<string, 'navy' | 'coral' | 'brand' | 'sun' | 'muted'> = {
  SCHEDULED: 'navy',
  LIVE: 'coral',
  COMPLETED: 'brand',
  RESCHEDULED: 'sun',
  CANCELLED: 'muted',
};

export const CALENDAR_ICON = FiCalendar;
