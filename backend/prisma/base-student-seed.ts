import type {
AccountStatus,
EnrollmentStatus,
Shift
} from "../src/generated/prisma/client.js";
export type StudentSeed = {
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  levelCode: string;
  intakeCode: string;
  shift: Shift;
  accountStatus: AccountStatus;
  enrollmentStatus: EnrollmentStatus;
  fee: number;
  paid: number;
  refund: number;
  discount: number;
  methodCode: string;
  dueInDays: number;
};
