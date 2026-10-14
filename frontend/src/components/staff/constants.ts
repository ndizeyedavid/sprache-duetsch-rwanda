import type { AuthRole } from '../../lib/auth-store';
import type { StaffFilters } from './types';

export const EMPTY_FILTERS: StaffFilters = {
  query: '',
  role: '',
  status: '',
  suspendedOnly: false,
};

/**
 * Staff roles and what each one can actually reach. The scope lines mirror the
 * backend `requireRole(...)` guards in the users, payments and sessions routers —
 * the dialogs quote them so an academic admin never grants a role blind.
 */
export const ROLE_OPTIONS = [
  {
    value: 'TEACHER',
    label: 'Teacher',
    scope: 'Teaches the levels and classes assigned to them, marks attendance, grades and reports.',
    limits: 'Cannot see staff accounts, finance or system settings.',
  },
  {
    value: 'ACADEMIC_ADMIN',
    label: 'Academic Admin',
    scope: 'Manages people, classes, enrolments, curriculum, announcements and certificates — plus the whole finance module, since enrolments create the tuition charge.',
    limits: 'Cannot change staff roles or reset passwords; those stay with a super admin.',
  },
  {
    value: 'FINANCE_ADMIN',
    label: 'Finance Admin',
    scope: 'Manages payment methods, charges, discounts, payments, refunds and finance reports.',
    limits: 'No academic, people or system access by default.',
  },
  {
    value: 'SUPER_ADMIN',
    label: 'Super Admin',
    scope: 'Everything an academic and a finance admin can do, plus staff roles and password resets.',
    limits: 'Keep to one or two accounts — every action is audited.',
  },
] as const;

export const ROLE_LABELS: Record<string, string> = {
  TEACHER: 'Teacher',
  ACADEMIC_ADMIN: 'Academic Admin',
  FINANCE_ADMIN: 'Finance Admin',
  SUPER_ADMIN: 'Super Admin',
};

/** `roles/users?role=` accepts exactly this set — students are created at registration. */
export const FILTER_ROLES = ROLE_OPTIONS.map((role) => role.value);

/**
 * Staff statuses. `SUSPENDED` and `WITHDRAWN` are the only statuses the API
 * refuses at sign-in (`BLOCKED_LOGIN_STATUSES` in `auth.service.ts`) — `PENDING`
 * is the create-time default and a pending account can still sign in.
 */
export const STATUS_OPTIONS = [
  {
    value: 'ACTIVE',
    label: 'Active',
    hint: 'Signs in normally and reaches every module their role allows.',
  },
  {
    value: 'PENDING',
    label: 'Pending',
    hint: 'Default for a new account. Can still sign in — set Active once their details are confirmed.',
  },
  {
    value: 'SUSPENDED',
    label: 'Suspended',
    hint: 'Sign-in is refused and every session is revoked. Used for offboarding — the record and its teaching history stay.',
  },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  SUSPENDED: 'Suspended',
  COMPLETED: 'Completed',
  WITHDRAWN: 'Withdrawn',
  GRADUATED: 'Graduated',
};

/**
 * Account status tints the monogram; the label beside it always carries the same
 * meaning, so colour never stands alone. `bg-sun`/`bg-coral` are far too light for
 * white text, so the glyph always uses a darkened tone that passes WCAG AA.
 */
export const STATUS_SURFACE: Record<string, string> = {
  ACTIVE: 'bg-brand text-primary-content text-[#B30A00]',
  PENDING: 'bg-sun text-warning-content text-[#8A6800]',
  SUSPENDED: 'bg-coral text-error-content text-[#D8482F]',
  COMPLETED: 'bg-base-200 text-ink',
  GRADUATED: 'bg-base-200 text-ink',
  WITHDRAWN: 'bg-base-200 text-ink',
};

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

/** Least privilege, mirroring `users.service.createUser` / `updateUser`. */
export function capabilityFor(role: AuthRole | undefined): {
  isSuper: boolean;
  creatableRoles: string[];
  manageableRoles: string[];
} {
  const isSuper = role === 'SUPER_ADMIN';
  return {
    isSuper,
    creatableRoles: isSuper ? FILTER_ROLES : ['TEACHER'],
    manageableRoles: isSuper ? FILTER_ROLES : ['TEACHER'],
  };
}

export const STAFF_FIELD_CLASS =
  'input w-full rounded-field border-line bg-base-200 text-sm disabled:text-muted';

export const STAFF_SELECT_CLASS =
  'select w-full rounded-field border-line bg-base-200 text-sm disabled:text-muted';

export const FIELD_LABEL_CLASS =
  'mb-1.5 block text-[11px] font-semibold tracking-wide text-ink uppercase';