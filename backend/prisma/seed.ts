// Seed script for the Deutsch Sprache RW Phase 1 MVP.
// Idempotent: reference data is upserted, transactional demo data is cleared and
// rebuilt for the seeded entities so `prisma db seed` can run repeatedly.
//
// Run with: npm run db:seed   (wired through package.json -> "prisma": { "seed": ... })

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
  A1: "nadine@sparch.rw",
  A2: "clarisse@sparch.rw",
  B1: "jeanpaul@sparch.rw",
  B2: "aline@sparch.rw",
  "B1-BERUF": "yves@sparch.rw",
  "B2-TESTDAF": "eric@sparch.rw",
};

// Demo students. `paid`/`refund`/`discount` drive the financial status each row lands in.
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
  {
    code: "SDR-2024-0301",
    firstName: "Nella",
    lastName: "Ishimwe",
    email: "nella@student.sparch.rw",
    phone: "+250 788 100 301",
    levelCode: "A2",
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

const lessonTitles = [
  "Einführung",
  "Erste Schritte",
  "Werkzeuge & Aussprache",
  "Wortschatz im Alltag",
  "Grammatik Basis",
  "Übungen & Wiederholung",
];

const moduleTitles = ["Grundlagen", "Aufbau & Anwendung"];

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

const seedContent = async (params: {
  levelIds: Map<string, string>;
  staffIds: Map<string, string>;
}) => {
  const { levelIds, staffIds } = params;
  const uploaderId = staffIds.get("academic@sparch.rw") ?? null;

  for (const level of levels) {
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

          await prisma.activity.deleteMany({ where: { lessonId: lesson.id } });
          await prisma.activity.createMany({
            data: [
              {
                lessonId: lesson.id,
                title: "Vokabeln zuordnen",
                type: "MATCHING",
                instructions: "Verbinde das Wort mit der richtigen Übersetzung.",
                config: {
                  pairs: [
                    { left: "Hallo", right: "Muraho" },
                    { left: "Danke", right: "Murakoze" },
                  ],
                },
                order: 1,
                isPublished: true,
              },
              {
                lessonId: lesson.id,
                title: "Lückentext",
                type: "FILL_BLANK",
                instructions: "Ergänze die fehlenden Wörter.",
                config: { sentences: [{ text: "Ich ___ aus Ruanda.", answer: "komme" }] },
                order: 2,
                isPublished: true,
              },
            ],
          });
        }
      }
    }
  }
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

      const receiptCount = await prisma.receipt.count();
      await prisma.receipt.create({
        data: {
          paymentId: payment.id,
          receiptNumber: `RCP-SEED-${String(receiptCount + 1).padStart(4, "0")}`,
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
  const a2ClassId = classIds.get("A2")!;

  await prisma.classSession.deleteMany({ where: { classGroupId: a2ClassId } });

  const teacherId = staffIds.get("clarisse@sparch.rw") ?? null;
  const a2Students = ["SDR-2024-0142", "SDR-2024-0301"].map((code) => studentIds.get(code)!);

  const sessions = [
    {
      title: "Grammatik: Akkusativ",
      startAt: daysFromNow(-7),
      endAt: daysFromNow(-7),
      status: "COMPLETED" as const,
      attendance: ["PRESENT", "LATE"] as AttendanceStatus[],
    },
    {
      title: "Konversation im Alltag",
      startAt: daysFromNow(0),
      endAt: daysFromNow(0),
      status: "SCHEDULED" as const,
      attendance: null,
    },
    {
      title: "Prüfungstraining A2",
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
        classGroupId: a2ClassId,
        teacherId,
        title: session.title,
        mode: "ONLINE",
        provider: "GOOGLE_MEET",
        meetingUrl: "https://meet.google.com/sparch-a2-demo",
        startAt: start,
        endAt: end,
        timezone: "Africa/Kigali",
        status: session.status,
      },
    });

    if (session.attendance) {
      for (let i = 0; i < a2Students.length; i += 1) {
        await prisma.attendance.create({
          data: {
            sessionId: created.id,
            studentId: a2Students[i],
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
  const nellaId = studentIds.get("SDR-2024-0301")!;
  const patrickId = studentIds.get("SDR-2024-0187")!;

  const nellaUser = await prisma.student.findUnique({
    where: { id: nellaId },
    select: { userId: true },
  });
  const patrickUser = await prisma.student.findUnique({
    where: { id: patrickId },
    select: { userId: true },
  });
  if (!nellaUser || !patrickUser) return;

  await prisma.notification.deleteMany({
    where: { userId: { in: [nellaUser.userId, patrickUser.userId] } },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: nellaUser.userId,
        type: "SCHEDULE",
        channel: "IN_APP",
        title: "Live-Klasse heute 18:00",
        body: "Konversation im Alltag — Klicke zum Beitreten.",
        data: { link: "https://meet.google.com/sparch-a2-demo" },
      },
      {
        userId: nellaUser.userId,
        type: "PAYMENT",
        channel: "IN_APP",
        title: "Offener Betrag",
        body: "Dein Saldo beträgt 25.000 RWF. Teilzahlungen sind möglich.",
      },
      {
        userId: patrickUser.userId,
        type: "EXAM",
        channel: "IN_APP",
        title: "Neue Aufgabe verfügbar",
        body: "Berufsdeutsch B1 — Vorstellungsgespräch Übung ist bereit.",
      },
    ],
  });
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

  console.info("→ Seeding curriculum (modules, lessons, materials, activities)");
  await seedContent({ levelIds, staffIds });

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

  console.info("✔ Seed complete");
  console.info(`  Super admin: ${staffAccounts[0].email} / ${staffAccounts[0].password}`);
  console.info("  Teacher:     clarisse@sparch.rw / Teacher123!");
  console.info("  Finance:     finance@sparch.rw / Finance123!");
  console.info("  Student:     nella@student.sparch.rw / Student123!");
};

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
