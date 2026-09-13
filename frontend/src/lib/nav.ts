import {
  FiBook,
  FiCalendar,
  FiClipboard,
  FiGrid,
  FiLink,
  FiUser,
  FiUsers,
  FiVideo,
} from 'react-icons/fi';
import type { NavItem, Role } from '../types';

export const NAV: Record<Role, NavItem[]> = {
  student: [
    { label: 'Dashboard', to: '/dashboard', icon: FiGrid },
    { label: 'Courses', to: '/courses', icon: FiBook },
    { label: 'Schedule', to: '/schedule', icon: FiCalendar },
    { label: 'Teachers', to: '/instructors', icon: FiUsers },
    { label: 'Profile', to: '/profile', icon: FiUser },
    { label: 'Activity', to: '/activity', icon: FiClipboard },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin', icon: FiGrid },
    { label: 'Courses', to: '/admin/courses', icon: FiBook },
    { label: 'Schedule', to: '/admin/schedule', icon: FiCalendar },
    { label: 'Students', to: '/admin/students', icon: FiUsers },
    { label: 'Resources', to: '/admin/resources', icon: FiLink },
    { label: 'Transactions', to: '/admin/transactions', icon: FiClipboard },
    { label: 'Live Class', to: '/admin/live-class', icon: FiVideo },
  ],
};

export function getRole(pathname: string): Role {
  return pathname.startsWith('/admin') ? 'admin' : 'student';
}

const TITLES: { match: RegExp; title: string }[] = [
  { match: /^\/courses\/[^/]+\/learn$/, title: 'Course Contents' },
  { match: /^\/courses\/[^/]+$/, title: 'Course Overview' },
  { match: /^\/messages$/, title: 'Messages' },
  { match: /^\/dashboard$/, title: 'Dashboard' },
  { match: /^\/courses$/, title: 'Courses' },
  { match: /^\/schedule$/, title: 'Schedule' },
  { match: /^\/instructors$/, title: 'Teachers' },
  { match: /^\/profile$/, title: 'Profile' },
  { match: /^\/activity$/, title: 'Activity' },
  { match: /^\/admin\/courses$/, title: 'Courses' },
  { match: /^\/admin\/schedule$/, title: 'Schedule' },
  { match: /^\/admin\/students$/, title: 'Students' },
  { match: /^\/admin\/resources$/, title: 'Resources' },
  { match: /^\/admin\/transactions$/, title: 'Transactions' },
  { match: /^\/admin\/live-class$/, title: '' },
  { match: /^\/admin$/, title: 'Dashboard' },
];

export function getPageTitle(pathname: string): string {
  return TITLES.find((entry) => entry.match.test(pathname))?.title ?? '';
}
