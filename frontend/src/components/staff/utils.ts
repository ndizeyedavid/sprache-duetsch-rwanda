import type { UserRow } from '../../lib/services';
import { humanize } from '../../lib/services';
import { EMPTY_FILTERS,STATUS_SURFACE } from './constants';
import type { StaffFilters,StaffStats } from './types';

export function staffName(row: UserRow): string {
  return `${row.firstName} ${row.lastName}`.trim() || row.email;
}

export function initials(row: UserRow): string {
  return `${row.firstName.charAt(0)}${row.lastName.charAt(0)}`.toUpperCase() || '—';
}

/** `students` are created at registration, never through the staff form. */
export function staffOnly(rows: UserRow[]): UserRow[] {
  return rows.filter((row) => row.role !== 'STUDENT');
}

/** One lowercase haystack per row so filtering stays a single pass. */
function searchHaystack(row: UserRow): string {
  return [row.firstName, row.lastName, row.email, row.phone ?? ''].join(' ').toLowerCase();
}

export function hasActiveFilters(filters: StaffFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.role !== '' ||
    filters.status !== '' ||
    filters.suspendedOnly
  );
}

export function filterStaff(rows: UserRow[], filters: StaffFilters): UserRow[] {
  const needle = filters.query.trim().toLowerCase();
  return rows.filter((row) => {
    if (needle && !searchHaystack(row).includes(needle)) return false;
    if (filters.role && row.role !== filters.role) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.suspendedOnly && row.status !== 'SUSPENDED') return false;
    return true;
  });
}

export function staffStats(rows: UserRow[]): StaffStats {
  return {
    total: rows.length,
    active: rows.filter((row) => row.status === 'ACTIVE').length,
    pending: rows.filter((row) => row.status === 'PENDING').length,
    suspended: rows.filter((row) => row.status === 'SUSPENDED').length,
    neverSignedIn: rows.filter((row) => row.lastLoginAt === null).length,
  };
}

export function resetFilters(): StaffFilters {
  return { ...EMPTY_FILTERS };
}

/** Explains why a self-lockout action is disabled rather than hiding it silently. */
export function lockoutReason(action: 'status' | 'role' | 'password'): string {
  if (action === 'status') return 'You cannot suspend your own account.';
  if (action === 'role') return 'Ask another super admin to change your role.';
  return 'Change your own password from Settings.';
}

/** Tinted monogram fill + AA-safe text colour for a status. */
export function surfaceFor(status: string): string {
  return STATUS_SURFACE[status] ?? 'bg-base-200 text-ink';
}

export function statusLabel(status: string): string {
  return humanize(status);
}

/** "Today 14:20" / "12 Mar" / "Never" — the freshness signal on the roster. */
export function lastSeenLabel(value: string | null): string {
  if (!value) return 'Never signed in';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never signed in';
  return `Last seen ${date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })} · ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';

/**
 * Temporary password generator for the handover flow. Uses the Web Crypto RNG and
 * an alphabet with no look-alike characters, so a password read aloud over the
 * phone is not mistyped.
 */
export function generatePassword(length = 14): string {
  const size = Math.max(12, Math.min(length, 64));
  const values = new Uint32Array(size);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]).join(
    '',
  );
}

export function passwordProblem(
  value: string,
): { error: string | null; valid: boolean } {
  if (value.length === 0) return { error: 'Enter a temporary password.', valid: false };
  if (value.length < 8) return { error: 'Use at least 8 characters.', valid: false };
  if (value.length > 128) return { error: 'Use at most 128 characters.', valid: false };
  return { error: null, valid: true };
}