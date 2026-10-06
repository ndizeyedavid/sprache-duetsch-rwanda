import { hashPassword } from "../src/lib/password.js";
import { prisma } from "../src/lib/prisma.js";
import { staffAccounts } from './base-staff-accounts.js';
export const seedStaff = async () => {
  const byEmail = new Map<string, string>();
  for (const staff of staffAccounts) {
    const passwordHash = await hashPassword(staff.password);
    const record = await prisma.user.upsert({
      where: { email: staff.email },
      update: {
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
        status: "ACTIVE",
        passwordHash,
      },
      create: {
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
        status: "ACTIVE",
        passwordHash,
      },
    });
    byEmail.set(record.email, record.id);
  }
  return byEmail;
};
