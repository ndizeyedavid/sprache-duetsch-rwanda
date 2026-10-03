// Additional demo seed script for Deutsch Sprache RW.
// Contains demo/test levels (A2, B1, B2, B1-BERUF, B2-TESTDAF), their sample curriculum,
// demo class groups, and demo student enrollments.
//
// Run with: npm run db:seed:demo

import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/password.js";
import { recalculateStudentFinance } from "../src/lib/finance.js";
import type {
  AccountStatus,
  EnrollmentStatus,
  Shift,
} from "../src/generated/prisma/client.js";

const demoLevels = [
  {
    code: "A2",
    title: "Deutsch A2 — Grundstufe",
    levelLabel: "Elementary",
    order: 2,
    defaultFee: 45000,
    summary:
      "Hold simple conversations about work, family and travel. Past tense, Dativ and Akkusativ explained with Rwandan everyday examples.",
    objectives: [
      "Perfekt & Präteritum",
      "Akkusativ & Dativ",
      "Arbeit & Bewerbung",
      "Reisen & Transport",
      "Telefonieren",
      "Briefe schreiben",
    ],
  },
  {
    code: "B1",
    title: "Deutsch B1 — Mittelstufe",
    levelLabel: "Intermediate",
    order: 3,
    defaultFee: 55000,
    summary:
      "Become independent. Discuss opinions, read news articles and prepare for the Goethe B1 exam.",
    objectives: [
      "Nebensätze & Konnektoren",
      "Meinung & Diskussion",
      "Nachrichten lesen",
      "Prüfungstraining B1",
      "Formelle E-Mails",
      "Bewerbungsgespräch",
    ],
  },
  {
    code: "B2",
    title: "Deutsch B2 — Fortgeschritten",
    levelLabel: "Upper Intermediate",
    order: 4,
    defaultFee: 65000,
    summary:
      "University-level German. Academic writing, complex grammar, debates and listening to native speakers.",
    objectives: [
      "Passiv & Konjunktiv",
      "Akademisches Schreiben",
      "Debattieren",
      "Wissenschaftliches Hören",
      "Studium in Deutschland",
      "Prüfungstraining B2",
    ],
  },
  {
    code: "B1-BERUF",
    title: "Berufsdeutsch B1 — Pflege & Technik",
    levelLabel: "Intermediate",
    order: 5,
    defaultFee: 60000,
    summary:
      "German for nursing, hospitality and technical jobs, with interview practice and workplace vocabulary.",
    objectives: [
      "Pflege-Wortschatz",
      "Technik-Wortschatz",
      "Bewerbung & Lebenslauf",
      "Kollegengespräche",
      "Sicherheit am Arbeitsplatz",
      "Vorstellungsgespräch",
    ],
  },
  {
    code: "B2-TESTDAF",
    title: "TestDaF Vorbereitung",
    levelLabel: "Advanced",
    order: 6,
    defaultFee: 70000,
    summary:
      "Focused TestDaF drilling: Leseverstehen, Hörverstehen, Schriftlicher and Mündlicher Ausdruck with timed mock exams.",
    objectives: [
      "Leseverstehen Taktik",
      "Hörverstehen Taktik",
      "Schriftlicher Ausdruck",
      "Mündlicher Ausdruck",
      "Zeitmanagement",
      "Mock-Prüfungen",
    ],
  },
];

const teacherByLevel: Record<string, string> = {
  A2: "clarisse@sparch.rw",
  B1: "jeanpaul@sparch.rw",
  B2: "aline@sparch.rw",
  "B1-BERUF": "yves@sparch.rw",
  "B2-TESTDAF": "eric@sparch.rw",
};

type DemoStudentSeed = {
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

const demoStudentSeeds: DemoStudentSeed[] = [
  {
    code: "SDR-2024-0142",
    firstName: "Sandrine",
    lastName: "Ineza",
    email: "sandrine@student.sparch.rw",
    phone: "+250 788 100 142",
    levelCode: "A2",
    intakeCode: "INTAKE-2024-07",
    shift: "EVENING",
    accountStatus: "ACTIVE",
    enrollmentStatus: "COMPLETED",
    fee: 45000,
    paid: 45000,
    refund: 0,
    discount: 0,
    methodCode: "MOMO",
    dueInDays: -30,
  },
  {
    code: "SDR-2024-0187",
    firstName: "Patrick",
    lastName: "Mugenzi",
    email: "patrick@student.sparch.rw",
    phone: "+250 788 100 187",
    levelCode: "B1-BERUF",
    intakeCode: "INTAKE-2026-09",
    shift: "EVENING",
    accountStatus: "ACTIVE",
    enrollmentStatus: "ACTIVE",
    fee: 60000,
    paid: 30000,
    refund: 0,
    discount: 0,
    methodCode: "AIRTEL",
    dueInDays: 21,
  },
  {
    code: "SDR-2024-0211",
    firstName: "Fabrice",
    lastName: "Rwigema",
    email: "fabrice@student.sparch.rw",
    phone: "+250 788 100 211",
    levelCode: "B2-TESTDAF",
    intakeCode: "INTAKE-2026-09",
    shift: "WEEKEND",
    accountStatus: "ACTIVE",
    enrollmentStatus: "ACTIVE",
    fee: 70000,
    paid: 70000,
    refund: 0,
    discount: 0,
    methodCode: "CARD",
    dueInDays: -60,
  },
  {
    code: "SDR-2024-0234",
    firstName: "Solange",
    lastName: "Nyirahabimana",
    email: "solange@student.sparch.rw",
    phone: "+250 788 100 234",
    levelCode: "B2",
    intakeCode: "INTAKE-2024-07",
    shift: "EVENING",
    accountStatus: "GRADUATED",
    enrollmentStatus: "COMPLETED",
    fee: 65000,
    paid: 0,
    refund: 0,
    discount: 65000,
    methodCode: "SCHOLARSHIP",
    dueInDays: -120,
  },
  {
    code: "SDR-2024-0255",
    firstName: "Emmanuel",
    lastName: "Butera",
    email: "emmanuel@student.sparch.rw",
    phone: "+250 788 100 255",
    levelCode: "B1",
    intakeCode: "INTAKE-2026-01",
    shift: "AFTERNOON",
    accountStatus: "SUSPENDED",
    enrollmentStatus: "WITHDRAWN",
    fee: 55000,
    paid: 55000,
    refund: 55000,
    discount: 0,
    methodCode: "MOMO",
    dueInDays: -200,
  },
];

const lessonTitles = [
  "Einführung",
  "Erste Schritte",
  "Werkzeuge & Aussprache",
  "Wortschatz im Alltag",
  "Grammatik Basis",
  "Übungen & Wiederholung",
];

const moduleTitles = ["Grundlagen", "Aufbau & Anwendung"];

const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const seedDemoLevels = async () => {
  const byCode = new Map<string, string>();
  for (const level of demoLevels) {
    const record = await prisma.level.upsert({
      where: { code: level.code },
      update: { ...level, isActive: true },
      create: { ...level, isActive: true },
    });
    byCode.set(record.code, record.id);
  }
  return byCode;
};

const seedDemoClasses = async (params: {
  levelIds: Map<string, string>;
  campusId: string;
  intakeId: string;
}) => {
  const { levelIds, campusId, intakeId } = params;
  const byLevel = new Map<string, string>();

  for (const level of demoLevels) {
    const levelId = levelIds.get(level.code)!;
    const code = `CLS-${level.code}-2026-09`;

    const teacherEmail = teacherByLevel[level.code];
    const teacher = teacherEmail
      ? await prisma.user.findUnique({ where: { email: teacherEmail }, select: { id: true } })
      : null;

    const record = await prisma.classGroup.upsert({
      where: { code },
      update: {
        name: `${level.title} — Abendkurs`,
        levelId,
        intakeId,
        campusId,
        teacherId: teacher?.id ?? null,
        shift: "EVENING",
        isActive: true,
      },
      create: {
        code,
        name: `${level.title} — Abendkurs`,
        levelId,
        intakeId,
        campusId,
        teacherId: teacher?.id ?? null,
        shift: "EVENING",
        capacity: 30,
        room: "Raum 2",
        isActive: true,
      },
    });
    byLevel.set(level.code, record.id);
  }
  return byLevel;
};

const seedDemoContent = async (params: { levelIds: Map<string, string> }) => {
  const { levelIds } = params;
  const uploader = await prisma.user.findUnique({
    where: { email: "academic@sparch.rw" },
    select: { id: true },
  });
  const uploaderId = uploader?.id ?? null;

  for (const level of demoLevels) {
    const levelId = levelIds.get(level.code)!;

    for (let m = 0; m < moduleTitles.length; m += 1) {
      const order = m + 1;
      const moduleRecord = await prisma.module.upsert({
        where: { levelId_order: { levelId, order } },
        update: {
          title: `${level.code} — ${moduleTitles[m]}`,
          description: `Modul ${order} für ${level.title}.`,
          isPublished: true,
        },
        create: {
          levelId,
          title: `${level.code} — ${moduleTitles[m]}`,
          description: `Modul ${order} für ${level.title}.`,
          order,
          isPublished: true,
        },
      });

      for (let l = 0; l < lessonTitles.length; l += 1) {
        const lessonOrder = l + 1;
        const lesson = await prisma.lesson.upsert({
          where: { moduleId_order: { moduleId: moduleRecord.id, order: lessonOrder } },
          update: {
            title: `${lessonTitles[l]}`,
            description: `Lektion ${lessonOrder} — ${lessonTitles[l]}.`,
            isPublished: true,
          },
          create: {
            moduleId: moduleRecord.id,
            title: `${lessonTitles[l]}`,
            description: `Lektion ${lessonOrder} — ${lessonTitles[l]}.`,
            order: lessonOrder,
            contentType: "MIXED",
            body: `Lernziele dieser Lektion: ${lessonTitles[l]}. Übe mit Audio und kurzen Aufgaben.`,
            estimatedMinutes: 15 + lessonOrder * 5,
            isPublished: true,
          },
        });

        if (l === 0) {
          await prisma.lessonMaterial.deleteMany({ where: { lessonId: lesson.id } });
          await prisma.lessonMaterial.createMany({
            data: [
              {
                lessonId: lesson.id,
                title: `${lessonTitles[l]} — Notizen (PDF)`,
                type: "PDF",
                url: "https://sparch.rw/materials/notes.pdf",
                mimeType: "application/pdf",
                sizeBytes: 512000,
                isDownloadable: true,
                uploadedById: uploaderId,
              },
              {
                lessonId: lesson.id,
                title: `${lessonTitles[l]} — Audio`,
                type: "AUDIO",
                url: "https://sparch.rw/materials/audio.mp3",
                mimeType: "audio/mpeg",
                sizeBytes: 1024000,
                isDownloadable: true,
                uploadedById: uploaderId,
              },
            ],
          });
        }
      }
    }
  }
};

const seedDemoStudentsAndFinance = async (params: {
  levelIds: Map<string, string>;
  classIds: Map<string, string>;
  campusId: string;
}) => {
  const { levelIds, classIds, campusId } = params;
  const financeUser = await prisma.user.findUnique({
    where: { email: "finance@sparch.rw" },
    select: { id: true },
  });
  const financeUserId = financeUser?.id ?? null;

  const intakes = await prisma.intake.findMany({ select: { code: true, id: true } });
  const intakeMap = new Map(intakes.map((i) => [i.code, i.id]));

  const methods = await prisma.paymentMethodConfig.findMany({ select: { code: true, id: true } });
  const methodMap = new Map(methods.map((m) => [m.code, m.id]));

  for (const seed of demoStudentSeeds) {
    const passwordHash = await hashPassword("Student123!");
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: {
        firstName: seed.firstName,
        lastName: seed.lastName,
        phone: seed.phone,
        role: "STUDENT",
        status: seed.accountStatus,
        passwordHash,
      },
      create: {
        email: seed.email,
        firstName: seed.firstName,
        lastName: seed.lastName,
        phone: seed.phone,
        role: "STUDENT",
        status: seed.accountStatus,
        passwordHash,
      },
    });

    const levelId = levelIds.get(seed.levelCode)!;
    const intakeId = intakeMap.get(seed.intakeCode)!;

    const student = await prisma.student.upsert({
      where: { studentCode: seed.code },
      update: {
        userId: user.id,
        campusId,
        intakeId,
        intendedLevelId: levelId,
        currentLevelId: levelId,
        shift: seed.shift,
        status: seed.accountStatus,
      },
      create: {
        studentCode: seed.code,
        userId: user.id,
        campusId,
        intakeId,
        intendedLevelId: levelId,
        currentLevelId: levelId,
        shift: seed.shift,
        status: seed.accountStatus,
        placementScore: 50,
      },
    });

    await prisma.payment.deleteMany({ where: { studentId: student.id } });
    await prisma.discount.deleteMany({ where: { studentId: student.id } });
    await prisma.charge.deleteMany({ where: { studentId: student.id } });
    await prisma.enrollment.deleteMany({ where: { studentId: student.id } });

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        levelId,
        intakeId,
        campusId,
        classGroupId: classIds.get(seed.levelCode) ?? null,
        status: seed.enrollmentStatus,
        totalFee: seed.fee,
        discountTotal: seed.discount,
        completedAt: seed.enrollmentStatus === "COMPLETED" ? daysFromNow(-5) : null,
      },
    });

    await prisma.charge.create({
      data: {
        studentId: student.id,
        enrollmentId: enrollment.id,
        type: "TUITION",
        description: `Studiengebühr ${seed.levelCode}`,
        amount: seed.fee,
        dueDate: daysFromNow(seed.dueInDays),
        createdById: financeUserId,
      },
    });

    if (seed.discount > 0) {
      await prisma.discount.create({
        data: {
          studentId: student.id,
          enrollmentId: enrollment.id,
          type: "FIXED",
          value: seed.discount,
          amount: seed.discount,
          reason: "Stipendium (Seed-Daten)",
          status: "APPROVED",
          requestedById: financeUserId,
          approvedById: financeUserId,
          approvedAt: daysFromNow(-100),
        },
      });
    }

    let lastPaymentId: string | null = null;
    if (seed.paid > 0 && methodMap.has(seed.methodCode)) {
      const payment = await prisma.payment.create({
        data: {
          studentId: student.id,
          enrollmentId: enrollment.id,
          methodId: methodMap.get(seed.methodCode)!,
          amount: seed.paid,
          txnType: "PAYMENT",
          reference: `REF-${seed.code}`,
          paidAt: daysFromNow(-40),
          receivedById: financeUserId,
        },
      });
      lastPaymentId = payment.id;

      await prisma.receipt.create({
        data: {
          paymentId: payment.id,
          receiptNumber: `RCP-${payment.id.slice(0, 8).toUpperCase()}`,
          issuedById: financeUserId,
        },
      });
    }

    if (seed.refund > 0 && lastPaymentId && methodMap.has(seed.methodCode)) {
      await prisma.payment.create({
        data: {
          studentId: student.id,
          enrollmentId: enrollment.id,
          methodId: methodMap.get(seed.methodCode)!,
          amount: seed.refund,
          txnType: "REFUND",
          parentPaymentId: lastPaymentId,
          reference: `REFUND-${seed.code}`,
          paidAt: daysFromNow(-20),
          receivedById: financeUserId,
          notes: "Rückerstattung (Seed-Daten)",
        },
      });
    }

    await recalculateStudentFinance(prisma, student.id);
  }
};

const main = async () => {
  console.info("→ Seeding additional demo levels (A2, B1, B2, B1-BERUF, B2-TESTDAF)");
  const levelIds = await seedDemoLevels();

  const remera = await prisma.campus.findUnique({ where: { code: "REMERA" } });
  if (!remera) {
    throw new Error("Base seed must be run first: 'npm run db:seed'");
  }

  const intake = await prisma.intake.findUnique({ where: { code: "INTAKE-2026-09" } });
  if (!intake) {
    throw new Error("Base seed must be run first: 'npm run db:seed'");
  }

  console.info("→ Seeding demo class groups");
  const classIds = await seedDemoClasses({
    levelIds,
    campusId: remera.id,
    intakeId: intake.id,
  });

  console.info("→ Seeding demo curriculum (modules and lessons)");
  await seedDemoContent({ levelIds });

  console.info("→ Seeding demo students and enrollments");
  await seedDemoStudentsAndFinance({
    levelIds,
    classIds,
    campusId: remera.id,
  });

  console.info("✔ Demo seed complete");
};

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
