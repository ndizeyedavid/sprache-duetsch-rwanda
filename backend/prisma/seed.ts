// Seed script for the Deutsch Sprache RW Phase 1 MVP.
// Idempotent: reference data is upserted, transactional demo data is cleared and
// rebuilt for the seeded entities so `prisma db seed` can run repeatedly.
//
// Run with: npm run db:seed   (wired through package.json -> "prisma": { "seed": ... })

import { seedContent } from "./seed-content.js";
import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/password.js";
import { recalculateStudentFinance } from "../src/lib/finance.js";
import type {
  AccountStatus,
  AttendanceStatus,
  EnrollmentStatus,
  Shift,
  Skill,
} from "../src/generated/prisma/client.js";

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const campuses = [
  {
    code: "REMERA",
    name: "Kigali — Remera",
    address: "KG 11 Ave, Remera — Kigali, Rwanda",
    phone: "+250 788 456 790",
    email: "remera@sparch.rw",
  },
  {
    code: "NYAMI",
    name: "Kigali — Nyamirambo",
    address: "Nyamirambo, Kigali, Rwanda",
    phone: "+250 788 456 791",
    email: "nyamirambo@sparch.rw",
  },
  {
    code: "HUYE",
    name: "Huye Campus",
    address: "Huye, Southern Province, Rwanda",
    phone: "+250 788 456 792",
    email: "huye@sparch.rw",
  },
];

const levels = [
  {
    code: "A1",
    title: "Deutsch A1 — Anfänger",
    levelLabel: "Beginner",
    order: 1,
    defaultFee: 45000,
    summary:
      "Start from zero: alphabet, greetings, numbers, everyday phrases and your first 500 German words.",
    objectives: [
      "Alphabet & Aussprache",
      "Vorstellung & Begrüssung",
      "Zahlen & Uhrzeit",
      "Einkaufen & Restaurant",
      "Präsens & einfache Sätze",
      "Erste 500 Wörter",
    ],
  },
];

const intakes = [
  {
    code: "INTAKE-2024-07",
    name: "Intake 07 / 2024",
    startDate: new Date("2024-07-01T00:00:00Z"),
    endDate: new Date("2024-12-20T00:00:00Z"),
    registrationFee: 5000,
    bookFee: 10000,
    isActive: false,
  },
  {
    code: "INTAKE-2026-01",
    name: "Intake 01 / 2026",
    startDate: new Date("2026-01-05T00:00:00Z"),
    endDate: new Date("2026-06-30T00:00:00Z"),
    registrationFee: 5000,
    bookFee: 10000,
    isActive: false,
  },
  {
    code: "INTAKE-2026-09",
    name: "Intake 09 / 2026",
    startDate: new Date("2026-09-07T00:00:00Z"),
    endDate: new Date("2027-02-27T00:00:00Z"),
    registrationFee: 5000,
    bookFee: 10000,
    isActive: true,
  },
];

const paymentMethods = [
  {
    code: "MOMO",
    name: "MTN MoMo",
    requiresReference: true,
    sortOrder: 1,
    instructions: "Dial *182*1*1# and use the school code.",
  },
  { code: "AIRTEL", name: "Airtel Money", requiresReference: true, sortOrder: 2 },
  {
    code: "BANK",
    name: "Bank Transfer",
    requiresReference: true,
    sortOrder: 3,
    instructions: "Bank of Kigali · Acc 000123456789",
  },
  {
    code: "CARD",
    name: "Card",
    requiresReference: true,
    sortOrder: 4,
    instructions: "Card details are never stored by the platform.",
  },
  { code: "CASH", name: "Cash", requiresReference: false, sortOrder: 5 },
  { code: "SCHOLARSHIP", name: "Scholarship", requiresReference: false, sortOrder: 6 },
];

// Staff accounts. Password is shared per group for the demo dataset.
const staffAccounts = [
  {
    email: "admin@sparch.rw",
    firstName: "System",
    lastName: "Administrator",
    role: "SUPER_ADMIN",
    password: "Admin123!",
  },
  {
    email: "academic@sparch.rw",
    firstName: "Aline",
    lastName: "Mukamurenzi",
    role: "ACADEMIC_ADMIN",
    password: "Academic123!",
  },
  {
    email: "finance@sparch.rw",
    firstName: "David",
    lastName: "Rugamba",
    role: "FINANCE_ADMIN",
    password: "Finance123!",
  },
  {
    email: "clarisse@sparch.rw",
    firstName: "Clarisse",
    lastName: "Uwase",
    role: "TEACHER",
    password: "Teacher123!",
  },
  {
    email: "nadine@sparch.rw",
    firstName: "Nadine",
    lastName: "Mukamana",
    role: "TEACHER",
    password: "Teacher123!",
  },
  {
    email: "jeanpaul@sparch.rw",
    firstName: "Jean-Paul",
    lastName: "Habimana",
    role: "TEACHER",
    password: "Teacher123!",
  },
  {
    email: "aline@sparch.rw",
    firstName: "Aline",
    lastName: "Uwimana",
    role: "TEACHER",
    password: "Teacher123!",
  },
  {
    email: "eric@sparch.rw",
    firstName: "Eric",
    lastName: "Nshuti",
    role: "TEACHER",
    password: "Teacher123!",
  },
  {
    email: "yves@sparch.rw",
    firstName: "Yves",
    lastName: "Kagabo",
    role: "TEACHER",
    password: "Teacher123!",
  },
] as const;

const teacherByLevel: Record<string, string> = {
  A1: "clarisse@sparch.rw",
};

// Seed students for the clean dataset (A1). Nella is the primary active demo student,
// Diane is a pending/unpaid registration.
type StudentSeed = {
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

const studentSeeds: StudentSeed[] = [
  {
    code: "SDR-2024-0203",
    firstName: "Diane",
    lastName: "Umutoni",
    email: "diane@student.sparch.rw",
    phone: "+250 788 100 203",
    levelCode: "A1",
    intakeCode: "INTAKE-2026-09",
    shift: "MORNING",
    accountStatus: "PENDING",
    enrollmentStatus: "ACTIVE",
    fee: 45000,
    paid: 0,
    refund: 0,
    discount: 0,
    methodCode: "BANK",
    dueInDays: -14,
  },
  {
    code: "SDR-2024-0301",
    firstName: "Nella",
    lastName: "Ishimwe",
    email: "nella@student.sparch.rw",
    phone: "+250 788 100 301",
    levelCode: "A1",
    intakeCode: "INTAKE-2026-09",
    shift: "EVENING",
    accountStatus: "ACTIVE",
    enrollmentStatus: "ACTIVE",
    fee: 45000,
    paid: 20000,
    refund: 0,
    discount: 0,
    methodCode: "MOMO",
    dueInDays: 14,
  },
];



// ---------------------------------------------------------------------------
// Seed steps
// ---------------------------------------------------------------------------

const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const seedCampuses = async () => {
  const byCode = new Map<string, string>();
  for (const campus of campuses) {
    const record = await prisma.campus.upsert({
      where: { code: campus.code },
      update: { ...campus, isActive: true },
      create: { ...campus, isActive: true },
    });
    byCode.set(record.code, record.id);
  }
  return byCode;
};

const seedLevels = async () => {
  const byCode = new Map<string, string>();
  for (const level of levels) {
    const record = await prisma.level.upsert({
      where: { code: level.code },
      update: { ...level, isActive: true },
      create: { ...level, isActive: true },
    });
    byCode.set(record.code, record.id);
  }
  return byCode;
};

const seedIntakes = async () => {
  const byCode = new Map<string, string>();
  for (const intake of intakes) {
    const record = await prisma.intake.upsert({
      where: { code: intake.code },
      update: { ...intake },
      create: { ...intake },
    });
    byCode.set(record.code, record.id);
  }
  return byCode;
};

const seedPaymentMethods = async () => {
  const byCode = new Map<string, string>();
  for (const method of paymentMethods) {
    const record = await prisma.paymentMethodConfig.upsert({
      where: { code: method.code },
      update: { ...method, isActive: true },
      create: { ...method, isActive: true },
    });
    byCode.set(record.code, record.id);
  }
  return byCode;
};

const seedStaff = async () => {
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

const seedClasses = async (params: {
  levelIds: Map<string, string>;
  intakeIds: Map<string, string>;
  campusIds: Map<string, string>;
  staffIds: Map<string, string>;
}) => {
  const { levelIds, intakeIds, campusIds, staffIds } = params;
  const byLevel = new Map<string, string>();
  const campusId = campusIds.get("REMERA")!;
  const intakeId = intakeIds.get("INTAKE-2026-09")!;

  for (const level of levels) {
    const levelId = levelIds.get(level.code)!;
    const code = `CLS-${level.code}-2026-09`;
    const record = await prisma.classGroup.upsert({
      where: { code },
      update: {
        name: `${level.title} — Abendkurs`,
        levelId,
        intakeId,
        campusId,
        teacherId: staffIds.get(teacherByLevel[level.code]) ?? null,
        shift: "EVENING",
        isActive: true,
      },
      create: {
        code,
        name: `${level.title} — Abendkurs`,
        levelId,
        intakeId,
        campusId,
        teacherId: staffIds.get(teacherByLevel[level.code]) ?? null,
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

const seedQuestionBank = async (params: { levelIds: Map<string, string> }) => {
  const { levelIds } = params;
  const levelId = levelIds.get("A1")!;

  const questions: {
    prompt: string;
    type: "SINGLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";
    skill: Skill;
    options?: unknown;
    correctAnswer: unknown;
    explanation?: string;
  }[] = [
    {
      prompt: "Wie sagt man «Good morning» auf Deutsch?",
      type: "SINGLE_CHOICE",
      skill: "VOCABULARY",
      options: ["Guten Morgen", "Guten Abend", "Gute Nacht", "Guten Tag"],
      correctAnswer: "Guten Morgen",
      explanation: "«Guten Morgen» wird bis etwa 11 Uhr verwendet.",
    },
    {
      prompt: "Der Artikel von «Buch» ist «das».",
      type: "TRUE_FALSE",
      skill: "GRAMMAR",
      options: ["Richtig", "Falsch"],
      correctAnswer: "Richtig",
    },
    {
      prompt: "Ich ___ Student.",
      type: "FILL_BLANK",
      skill: "GRAMMAR",
      correctAnswer: "bin",
      explanation: "Erste Person Singular von «sein» ist «bin».",
    },
  ];

  const questionIds: string[] = [];
  for (const q of questions) {
    const existing = await prisma.question.findFirst({ where: { levelId, prompt: q.prompt } });
    const record =
      existing ??
      (await prisma.question.create({
        data: {
          levelId,
          skill: q.skill,
          difficulty: "EASY",
          type: q.type,
          prompt: q.prompt,
          explanation: q.explanation ?? null,
          options: q.options ?? null,
          correctAnswer: q.correctAnswer,
          points: 1,
        },
      }));
    questionIds.push(record.id);
  }

  const title = "Einstufungstest — A1";
  let assessment = await prisma.assessment.findFirst({ where: { levelId, title } });
  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: {
        levelId,
        title,
        description: "Kurzer Test zur Einstufung. Empfiehlt A1 oder höher.",
        type: "PLACEMENT",
        durationMinutes: 15,
        maxAttempts: 1,
        passMark: 50,
        isPublished: true,
      },
    });
  }

  for (let i = 0; i < questionIds.length; i += 1) {
    await prisma.assessmentQuestion.upsert({
      where: {
        assessmentId_questionId: { assessmentId: assessment.id, questionId: questionIds[i] },
      },
      update: { order: i + 1 },
      create: { assessmentId: assessment.id, questionId: questionIds[i], order: i + 1 },
    });
  }
};

const seedStudentsAndFinance = async (params: {
  levelIds: Map<string, string>;
  intakeIds: Map<string, string>;
  campusIds: Map<string, string>;
  classIds: Map<string, string>;
  methodIds: Map<string, string>;
  staffIds: Map<string, string>;
}) => {
  const { levelIds, intakeIds, campusIds, classIds, methodIds, staffIds } = params;
  const remeraId = campusIds.get("REMERA")!;
  const financeUserId = staffIds.get("finance@sparch.rw") ?? null;
  const studentIds = new Map<string, string>();

  for (const seed of studentSeeds) {
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
    const intakeId = intakeIds.get(seed.intakeCode)!;

    const student = await prisma.student.upsert({
      where: { studentCode: seed.code },
      update: {
        userId: user.id,
        campusId: remeraId,
        intakeId,
        intendedLevelId: levelId,
        currentLevelId: levelId,
        shift: seed.shift,
        status: seed.accountStatus,
      },
      create: {
        studentCode: seed.code,
        userId: user.id,
        campusId: remeraId,
        intakeId,
        intendedLevelId: levelId,
        currentLevelId: levelId,
        shift: seed.shift,
        status: seed.accountStatus,
        placementScore: 50,
      },
    });
    studentIds.set(seed.code, student.id);

    // Clear previous demo transactions so the seed stays idempotent.
    await prisma.payment.deleteMany({ where: { studentId: student.id } });
    await prisma.discount.deleteMany({ where: { studentId: student.id } });
    await prisma.charge.deleteMany({ where: { studentId: student.id } });
    await prisma.enrollment.deleteMany({ where: { studentId: student.id } });

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        levelId,
        intakeId,
        campusId: remeraId,
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
    if (seed.paid > 0) {
      const payment = await prisma.payment.create({
        data: {
          studentId: student.id,
          enrollmentId: enrollment.id,
          methodId: methodIds.get(seed.methodCode)!,
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

    if (seed.refund > 0 && lastPaymentId) {
      await prisma.payment.create({
        data: {
          studentId: student.id,
          enrollmentId: enrollment.id,
          methodId: methodIds.get(seed.methodCode)!,
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

  return studentIds;
};

const seedSessionsAndAttendance = async (params: {
  classIds: Map<string, string>;
  staffIds: Map<string, string>;
  studentIds: Map<string, string>;
}) => {
  const { classIds, staffIds, studentIds } = params;
  const a1ClassId = classIds.get("A1");
  if (!a1ClassId) return;

  await prisma.classSession.deleteMany({ where: { classGroupId: a1ClassId } });

  const teacherId = staffIds.get("clarisse@sparch.rw") ?? null;
  const a1Students = ["SDR-2024-0301"]
    .map((code) => studentIds.get(code))
    .filter((id): id is string => Boolean(id));

  const sessions = [
    {
      title: "Grammatik: Erste Schritte & Aussprache",
      startAt: daysFromNow(-7),
      endAt: daysFromNow(-7),
      status: "COMPLETED" as const,
      attendance: ["PRESENT"] as AttendanceStatus[],
    },
    {
      title: "Konversation: Begrüssung & Vorstellung",
      startAt: daysFromNow(0),
      endAt: daysFromNow(0),
      status: "SCHEDULED" as const,
      attendance: null,
    },
    {
      title: "Zahlen & Uhrzeit im Alltag",
      startAt: daysFromNow(3),
      endAt: daysFromNow(3),
      status: "SCHEDULED" as const,
      attendance: null,
    },
  ];

  for (const session of sessions) {
    const start = new Date(session.startAt);
    start.setHours(18, 0, 0, 0);
    const end = new Date(session.endAt);
    end.setHours(19, 30, 0, 0);

    const created = await prisma.classSession.create({
      data: {
        classGroupId: a1ClassId,
        teacherId,
        title: session.title,
        mode: "ONLINE",
        provider: "GOOGLE_MEET",
        meetingUrl: "https://meet.google.com/sparch-a1-demo",
        startAt: start,
        endAt: end,
        timezone: "Africa/Kigali",
        status: session.status,
      },
    });

    if (session.attendance) {
      for (let i = 0; i < a1Students.length; i += 1) {
        await prisma.attendance.create({
          data: {
            sessionId: created.id,
            studentId: a1Students[i],
            status: session.attendance[i] ?? "PRESENT",
            markedById: teacherId,
          },
        });
      }
    }
  }
};

const seedNotifications = async (params: { studentIds: Map<string, string> }) => {
  const { studentIds } = params;
  const nellaId = studentIds.get("SDR-2024-0301");
  if (!nellaId) return;

  const nellaUser = await prisma.student.findUnique({
    where: { id: nellaId },
    select: { userId: true },
  });
  if (!nellaUser) return;

  await prisma.notification.deleteMany({
    where: { userId: nellaUser.userId },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: nellaUser.userId,
        type: "SCHEDULE",
        channel: "IN_APP",
        title: "Live-Klasse heute 18:00",
        body: "Begrüssung & Vorstellung — Klicke zum Beitreten.",
        data: { link: "https://meet.google.com/sparch-a1-demo" },
      },
      {
        userId: nellaUser.userId,
        type: "PAYMENT",
        channel: "IN_APP",
        title: "Offener Betrag",
        body: "Dein Saldo beträgt 25.000 RWF. Teilzahlungen sind möglich.",
      },
    ],
  });
};

const articles = [
  {
    slug: "a1-start-guide",
    title: "Deutsch A1 starten: dein 4-Wochen-Plan",
    excerpt: "Alphabet, Begrüssung, Zahlen — so meisterst du die ersten vier Wochen auf A1.",
    body: "Woche 1: Alphabet und Aussprache — übe jeden Tag 15 Minuten laut.\n\nWoche 2: Begrüssung und Vorstellung — stelle dich drei Personen vor.\n\nWoche 3: Zahlen, Uhrzeit und Preise — rechne deinen Einkauf auf Deutsch.\n\nWoche 4: Erste Sätze im Präsens — schreibe jeden Abend fünf Sätze in dein Heft.\n\nTipp: Lade die Audios aus deinen Lektionen herunter und höre sie im Bus.",
    isPublished: true,
  },
  {
    slug: "perfekt-vs-prateritum",
    title: "Perfekt oder Präteritum? Endlich verstehen",
    excerpt: "Wann du «ich habe gemacht» und wann «ich machte» sagst — mit Alltagsbeispielen.",
    body: "Im gesprochenen Deutsch hörst du fast immer das Perfekt: «Ich habe in Kigali gearbeitet.»\n\nDas Präteritum brauchst du vor allem für sein, haben und Modalverben: «Ich war müde», «Er konnte nicht kommen.»\n\nÜbung: Erzähle deinen gestrigen Tag — erst im Perfekt, dann schreibe drei Sätze mit war/hatte um.",
    isPublished: true,
  },
  {
    slug: "prufung-b1-tipps",
    title: "B1-Prüfung bestehen: 7 Tipps aus dem Unterricht",
    excerpt: "Zeitmanagement, Hörverstehen und der gefürchtete Brief — so gehst du vorbereitet rein.",
    body: "1. Lies zuerst alle Aufgaben, bevor du das Audio hörst.\n\n2. Unterstreiche Schlüsselwörter in der Frage.\n\n3. Trainiere den Brief mit der 5-Satz-Struktur aus Modul 2.\n\n4. Sprich in der mündlichen Prüfung langsam und deutlich — Fehler sind okay.\n\n5. Wiederhole jede Woche 50 Vokabeln mit Karteikarten.\n\n6. Mache mindestens zwei Probeprüfungen unter Zeitdruck.\n\n7. Schlafe gut — ein müder Kopf vergisst Artikel.",
    isPublished: true,
  },
];

const faqs = [
  {
    question: "Wie melde ich mich für einen Kurs an?",
    answer:
      "Erstelle ein Konto über Registrieren, wähle Campus, Schicht und dein Wunschlevel. Ein Admin bestätigt deine Anmeldung und teilt dich einer Klasse zu.",
    order: 0,
  },
  {
    question: "Kann ich in Raten zahlen?",
    answer:
      "Ja. Teilzahlungen sind möglich — MTN MoMo, Airtel Money, Bank oder bar. Dein Saldo und alle Quittungen siehst du in deinem Profil.",
    order: 1,
  },
  {
    question: "Wo finde ich den Link zur Live-Klasse?",
    answer:
      "Unter Stundenplan → Bevorstehende Kurse. Der Beitreten-Button erscheint, sobald dein Lehrer die Sitzung plant.",
    order: 2,
  },
  {
    question: "Wie erhalte ich ein Zertifikat?",
    answer:
      "Nach Abschluss aller Lektionen und bestandener Prüfung stellt ein akademischer Admin dein Zertifikat mit Verifizierungsnummer aus.",
    order: 3,
  },
];

const seedArticlesAndFaqs = async (params: { staffIds: Map<string, string> }) => {
  const authorId = params.staffIds.get("academic@sparch.rw") ?? null;

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        isPublished: article.isPublished,
        publishedAt: new Date(),
        authorId,
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        isPublished: article.isPublished,
        publishedAt: new Date(),
        authorId,
      },
    });
  }

  await prisma.faq.deleteMany({});
  await prisma.faq.createMany({ data: faqs });
};

const main = async () => {
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

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
