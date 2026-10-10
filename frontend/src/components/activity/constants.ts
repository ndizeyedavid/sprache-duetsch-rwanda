import { FiActivity,FiAward,FiBell,FiBookOpen,FiCalendar,FiClipboard,FiDollarSign,FiUsers } from 'react-icons/fi';

export const FILTERS = ['All', 'Announcement', 'Exam', 'Attendance', 'Enrollment', 'Payment', 'Class', 'Lesson'] as const;
export type Filter = (typeof FILTERS)[number];

export const FILTER_ICON: Record<Filter, typeof FiActivity> = {
  All: FiActivity,
  Announcement: FiBell,
  Exam: FiAward,
  Attendance: FiClipboard,
  Enrollment: FiUsers,
  Payment: FiDollarSign,
  Class: FiBookOpen,
  Lesson: FiCalendar,
};

export const TYPE_STYLE: Record<string, { icon: typeof FiActivity; tone: string; bg: string; label: string }> = {
  ANNOUNCEMENT: { icon: FiBell, tone: 'text-primary-content', bg: 'bg-primary', label: 'Announcement' },
  EXAM: { icon: FiAward, tone: 'text-primary-content', bg: 'bg-primary', label: 'Exam' },
  ATTENDANCE: { icon: FiClipboard, tone: 'text-info-content', bg: 'bg-info', label: 'Attendance' },
  ENROLLMENT: { icon: FiUsers, tone: 'text-success-content', bg: 'bg-success', label: 'Enrolment' },
  PAYMENT: { icon: FiDollarSign, tone: 'text-warning-content', bg: 'bg-warning', label: 'Payment' },
  CLASS: { icon: FiBookOpen, tone: 'text-neutral-content', bg: 'bg-neutral', label: 'Class' },
  LESSON: { icon: FiCalendar, tone: 'text-error-content', bg: 'bg-error', label: 'Lesson' },
  SCHEDULE: { icon: FiCalendar, tone: 'text-error-content', bg: 'bg-error', label: 'Schedule' },
  ASSIGNMENT: { icon: FiClipboard, tone: 'text-info-content', bg: 'bg-info', label: 'Assignment' },
  MESSAGE: { icon: FiActivity, tone: 'text-info-content', bg: 'bg-info', label: 'Message' },
  SYSTEM: { icon: FiActivity, tone: 'text-neutral-content', bg: 'bg-neutral', label: 'System' },
};

export const POST_TYPES = ['ANNOUNCEMENT', 'CLASS', 'SCHEDULE', 'EXAM', 'LESSON'] as const;
