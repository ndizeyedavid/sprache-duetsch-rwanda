import { z } from "zod";
import { idParam,optionalText,paginationQuery } from "../../lib/query.js";

export const roleEnum = z.enum([
  "STUDENT",
  "TEACHER",
  "ACADEMIC_ADMIN",
  "FINANCE_ADMIN",
  "SUPER_ADMIN",
]);

export const accountStatusEnum = z.enum([
  "ACTIVE",
  "PENDING",
  "SUSPENDED",
  "COMPLETED",
  "WITHDRAWN",
  "GRADUATED",
]);

export const listUserQuerySchema = z.object({
  role: roleEnum.optional(),
  status: accountStatusEnum.optional(),
  search: optionalText(160),
  ...paginationQuery,
});

export const createUserSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: optionalText(30),
  role: roleEnum,
});

export const updateUserSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    // Not `optionalText`: that helper maps "" and null to undefined, which Prisma
    // treats as "leave unchanged" — so a phone could be set but never cleared.
    phone: z.union([z.string().trim().min(1).max(30), z.null()]).optional(),
    avatarUrl: z.string().trim().url().max(500).optional(),
    status: accountStatusEnum.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const updateUserRoleSchema = z.object({
  role: roleEnum,
});

export const resetUserPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const userIdSchema = idParam;

export type ListUserQuery = z.infer<typeof listUserQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ResetUserPasswordInput = z.infer<typeof resetUserPasswordSchema>;
