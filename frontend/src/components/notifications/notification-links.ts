import type { InboxNotification } from '../../lib/notifications';
import type { Role } from '../../types';

/** Every role reads its inbox on the same page (mounted once, like Settings). */
export const NOTIFICATIONS_PATH = '/notifications';

const text = (value: unknown): string | null => (typeof value === 'string' && value.length > 0 ? value : null);

function messagesPath(role: Role): string {
  if (role === 'STUDENT') return '/messages';
  return role === 'TEACHER' ? '/teacher/messages' : '/admin/messages';
}

function studentLink(type: string, data: Record<string, unknown>): string | null {
  const assignmentId = text(data.assignmentId);
  switch (type) {
    case 'ASSIGNMENT':
    case 'EXAM':
      return assignmentId ? `/assignments/${encodeURIComponent(assignmentId)}` : '/assignments';
    case 'CLASS':
      // Low-attendance alerts carry a percentage; other class notices are schedule changes.
      return typeof data.percentage === 'number' ? '/attendance' : '/schedule';
    case 'SCHEDULE':
      return '/schedule';
    case 'PAYMENT':
      return '/payments';
    case 'LESSON':
      return '/courses';
    default:
      return null;
  }
}

function staffLink(type: string, role: Role): string | null {
  const academic = role === 'ACADEMIC_ADMIN' || role === 'SUPER_ADMIN';
  switch (type) {
    case 'ASSIGNMENT':
      if (role === 'TEACHER') return '/teacher/assignments';
      return academic ? '/admin/assignments' : null;
    case 'EXAM':
      if (role === 'TEACHER') return '/teacher/grading';
      return academic ? '/admin/grading' : null;
    case 'SCHEDULE':
    case 'CLASS':
      if (role === 'TEACHER') return '/teacher/schedule';
      return academic ? '/admin/schedule' : null;
    case 'PAYMENT':
      return role === 'FINANCE_ADMIN' || role === 'SUPER_ADMIN' ? '/admin/finance' : null;
    default:
      return null;
  }
}

/**
 * Where a notification should take this user, or null when it has nowhere to go.
 * Links stay inside the user's own role group so they never hit a guard redirect.
 */
export function notificationLink(item: Pick<InboxNotification, 'type' | 'data'>, role: Role): string | null {
  const data = item.data && typeof item.data === 'object' ? item.data : {};
  if (item.type === 'MESSAGE') {
    const thread = text(data.conversationId);
    return thread ? `${messagesPath(role)}?thread=${encodeURIComponent(thread)}` : messagesPath(role);
  }
  return role === 'STUDENT' ? studentLink(item.type, data) : staffLink(item.type, role);
}
