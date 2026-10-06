import { levels } from './base-levels.js';
import { prisma } from "../src/lib/prisma.js";
import { seedArticlesAndFaqs } from './base-seed-articles-and-faqs.js';
import { seedCampuses } from './base-seed-campuses.js';
import { seedClasses } from './base-seed-classes.js';
import { seedIntakes } from './base-seed-intakes.js';
import { seedLevels } from './base-seed-levels.js';
import { seedNotifications } from './base-seed-notifications.js';
import { seedPaymentMethods } from './base-seed-payment-methods.js';
import { seedQuestionBank } from './base-seed-question-bank.js';
import { seedSessionsAndAttendance } from './base-seed-sessions-and-attendance.js';
import { seedStaff } from './base-seed-staff.js';
import { seedStudentsAndFinance } from './base-seed-students-and-finance.js';
import { staffAccounts } from './base-staff-accounts.js';
import { seedContent } from "./seed-content.js";
export const main = async () => {
  console.info("→ Seeding campuses, levels, intakes, payment methods");
  const campusIds = await seedCampuses();
  const levelIds = await seedLevels();
  const intakeIds = await seedIntakes();
  const methodIds = await seedPaymentMethods();

  console.info("→ Seeding staff accounts");
  const staffIds = await seedStaff();

  console.info("→ Seeding class groups");
  const classIds = await seedClasses({ levelIds, intakeIds, campusIds, staffIds });
  const teachingClasses = await prisma.classGroup.findMany({ where: { teacherId: { not: null } }, select: { teacherId: true, levelId: true } });
  await prisma.teacherLevel.createMany({ data: teachingClasses.map(c => ({ teacherId: c.teacherId!, levelId: c.levelId, assignedById: null })), skipDuplicates: true });

  console.info("→ Seeding curriculum (modules, lessons, materials, activities)");
  await seedContent({ levelIds, staffIds, levels });

  console.info("→ Seeding question bank + placement test");
  await seedQuestionBank({ levelIds });

  console.info("→ Seeding students, enrollments, charges, payments, receipts");
  const studentIds = await seedStudentsAndFinance({
    levelIds,
    intakeIds,
    campusIds,
    classIds,
    methodIds,
    staffIds,
  });

  console.info("→ Seeding class sessions + attendance");
  await seedSessionsAndAttendance({ classIds, staffIds, studentIds });

  console.info("→ Seeding notifications");
  await seedNotifications({ studentIds });

  console.info("→ Seeding articles + FAQs");
  await seedArticlesAndFaqs({ staffIds });

  console.info("✔ Seed complete (Core dataset with A1 level)");
  console.info(`  Super admin: ${staffAccounts[0].email} / ${staffAccounts[0].password}`);
  console.info("  Teacher:     clarisse@sparch.rw / Teacher123!");
  console.info("  Finance:     finance@sparch.rw / Finance123!");
  console.info("  Student:     nella@student.sparch.rw / Student123!");
  console.info("  Demo levels: Run 'npm run db:seed:demo' if you want additional demo levels (A2-B2).");
};
