import type { UserRow } from '../../lib/services';

/** Which of the staff roles the signed-in admin is allowed to act on. */
export type StaffCapability = {
  isSuper: boolean;
  /** Roles this admin may create accounts for. */
  creatableRoles: string[];
  /** False when the API would 403 on `PATCH /users/:id` for this row. */
  canManage: (row: UserRow) => boolean;
};

export type StaffFilters = {
  query: string;
  role: string;
  status: string;
  suspendedOnly: boolean;
};

export type StaffStats = {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  neverSignedIn: number;
};

export type StaffDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  password: string;
};

/** Empty `phone` clears the number; an omitted key leaves the value untouched. */
export type StaffProfilePatch = {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  status?: string;
};

export type StaffDialog =
  | { kind: 'create' }
  | { kind: 'profile'; row: UserRow }
  | { kind: 'role'; row: UserRow }
  | { kind: 'password'; row: UserRow }
  | null;