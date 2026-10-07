export type UserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
};
