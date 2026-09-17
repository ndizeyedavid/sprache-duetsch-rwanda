import { FiAward, FiBell, FiBookOpen, FiCalendar, FiClipboard, FiDollarSign, FiUsers, FiActivity } from 'react-icons/fi';

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
  ANNOUNCEMENT: { icon: FiBell, tone: 'text-brand', bg: 'bg-brand-soft', label: 'Announcement' },
  EXAM: { icon: FiAward, tone: 'text-brand', bg: 'bg-brand-soft', label: 'Exam' },
  ATTENDANCE: { icon: FiClipboard, tone: 'text-info', bg: 'bg-info/10', label: 'Attendance' },
  ENROLLMENT: { icon: FiUsers, tone: 'text-success', bg: 'bg-success/10', label: 'Enrolment' },
  PAYMENT: { icon: FiDollarSign, tone: 'text-sun', bg: 'bg-sun-soft', label: 'Payment' },
  CLASS: { icon: FiBookOpen, tone: 'text-night', bg: 'bg-night/5', label: 'Class' },
  LESSON: { icon: FiCalendar, tone: 'text-coral', bg: 'bg-coral-soft', label: 'Lesson' },
  SCHEDULE: { icon: FiCalendar, tone: 'text-coral', bg: 'bg-coral-soft', label: 'Schedule' },
  ASSIGNMENT: { icon: FiClipboard, tone: 'text-info', bg: 'bg-info/10', label: 'Assignment' },
  MESSAGE: { icon: FiActivity, tone: 'text-info', bg: 'bg-info/10', label: 'Message' },
  SYSTEM: { icon: FiActivity, tone: 'text-muted', bg: 'bg-muted/10', label: 'System' },
};

export const POST_TYPES = ['ANNOUNCEMENT', 'CLASS', 'SCHEDULE', 'EXAM', 'LESSON'] as const;
