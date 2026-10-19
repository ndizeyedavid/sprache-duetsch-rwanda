import type { AuthRole } from '../../lib/auth-store';
import { ADMIN_ROLES } from '../../lib/roles';

type CommunityLink = { label: string; to: string };

const BASE: Record<AuthRole, string> = {
  STUDENT: '',
  TEACHER: '/teacher',
  ACADEMIC_ADMIN: '/admin',
  FINANCE_ADMIN: '/admin',
  SUPER_ADMIN: '/admin',
};

/** Role-aware hero links between Messages, Activity and (for academic admins) Announcements. */
export function communityLinks(role: AuthRole | undefined, page: 'messages' | 'activity'): CommunityLink[] {
  if (!role) return [];
  const base = BASE[role];
  const links: CommunityLink[] = [page === 'messages'
    ? { label: 'Activity', to: `${base}/activity` }
    : { label: 'Messages', to: `${base}/messages` }];
  if (ADMIN_ROLES.includes(role)) links.push({ label: 'Announcements', to: '/admin/announcements' });
  links.push({ label: 'Notifications', to: '/notifications' });
  return links;
}
