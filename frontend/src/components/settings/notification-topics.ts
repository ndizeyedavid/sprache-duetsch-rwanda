import type { NotificationPreferences } from '../../lib/notifications';
import type { Role } from '../../types';

type Toggle = { key: keyof NotificationPreferences; label: string; hint: string };

/** How you hear about things. Both apply to every topic below. */
export const CHANNELS: Toggle[] = [
  { key: 'inApp', label: 'In the app', hint: 'The bell at the top and your Notifications page.' },
  { key: 'email', label: 'Email', hint: 'A copy to the email address on your account.' },
];

const SCHEDULE: Toggle = { key: 'schedule', label: 'Classes and schedule', hint: 'New, moved or cancelled live classes, class reminders and attendance alerts.' };
const EXAM: Toggle = { key: 'exam', label: 'Lessons, assignments and exams', hint: 'New work, submissions, feedback and grades.' };
const PAYMENT: Toggle = { key: 'payment', label: 'Payments', hint: 'Fee reminders, due dates and confirmed payments.' };

/**
 * Topics a role can actually receive. Hidden topics keep their saved value, so
 * an academic admin never sees a payment toggle and finance never sees classes.
 */
export function topicsFor(role: Role): Toggle[] {
  switch (role) {
    case 'STUDENT':
    case 'SUPER_ADMIN':
      return [SCHEDULE, EXAM, PAYMENT];
    case 'FINANCE_ADMIN':
      return [PAYMENT];
    default:
      return [SCHEDULE, EXAM];
  }
}
