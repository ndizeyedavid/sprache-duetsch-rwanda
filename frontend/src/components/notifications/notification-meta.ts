import { formatDistanceStrict } from 'date-fns';
import type { IconType } from 'react-icons';
import { FiBell,FiBookOpen,FiCalendar,FiCreditCard,FiEdit3,FiInfo,FiMessageSquare,FiSpeaker } from 'react-icons/fi';

type TypeMeta = { label: string; icon: IconType };

const META: Record<string, TypeMeta> = {
  ANNOUNCEMENT: { label: 'Announcement', icon: FiSpeaker },
  LESSON: { label: 'Lesson', icon: FiBookOpen },
  ASSIGNMENT: { label: 'Assignment', icon: FiEdit3 },
  EXAM: { label: 'Exam', icon: FiEdit3 },
  PAYMENT: { label: 'Payment', icon: FiCreditCard },
  CLASS: { label: 'Class', icon: FiCalendar },
  SCHEDULE: { label: 'Schedule', icon: FiCalendar },
  MESSAGE: { label: 'Message', icon: FiMessageSquare },
  SYSTEM: { label: 'System', icon: FiInfo },
};

export function notificationMeta(type: string): TypeMeta {
  return META[type] ?? { label: 'Update', icon: FiBell };
}

/** "5 min ago" style label; falls back to nothing for bad dates. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  if (now.getTime() - date.getTime() < 60_000) return 'just now';
  return `${formatDistanceStrict(date, now)} ago`;
}

/** Badge text: hides zero and caps large counts. */
export function badgeLabel(count: number): string | null {
  if (count <= 0) return null;
  return count > 99 ? '99+' : String(count);
}
