import { articleArt, courseArt, liveClassArt, photos } from "../lib/images";
import type {
  ActivityItem,
  Article,
  ChatMessage,
  ChatThread,
  Course,
  Faq,
  LessonGroup,
  Review,
  ScheduleEvent,
  Student,
  Teacher,
  Transaction,
} from "../types";

export const currentUser = {
  name: "Nella Ishimwe",
  role: "Student",
  studentId: "SDR-2024-0142",
  level: "A2",
  campus: "Kigali — Remera",
  intake: "Intake 07 / 2024",
  shift: "Evening",
  memberSince: "Member Since January 2024",
  photo: photos.diane,
  points: 2300,
  certificates: 50,
  bio: "Learning German to study Mechatronics in Munich. I practise 30 minutes every evening and take notes in Kinyarwanda, English and German.",
};

export const teachers: Teacher[] = [
  {
    id: "tch-01",
    name: "Clarisse Uwase",
    photo: photos.clarisse,
    rating: 5,
    reviews: "1k",
    tags: ["Grammatik", "A1", "A2"],
    achievements: 100,
    certificates: 50,
  },
  {
    id: "tch-02",
    name: "Nadine Mukamana",
    photo: photos.nadine,
    rating: 5,
    reviews: "1k",
    tags: ["Aussprache", "A1", "Kinder"],
    achievements: 100,
    certificates: 50,
  },
  {
    id: "tch-03",
    name: "Jean-Paul Habimana",
    photo: photos.jeanPaul,
    rating: 5,
    reviews: "1k",
    tags: ["Lesen", "B1", "Prüfung"],
    achievements: 100,
    certificates: 50,
  },
  {
    id: "tch-04",
    name: "Aline Uwimana",
    photo: photos.aline,
    rating: 5,
    reviews: "1k",
    tags: ["Hören", "B1", "B2"],
    achievements: 100,
    certificates: 50,
  },
  {
    id: "tch-05",
    name: "Eric Nshuti",
    photo: photos.eric,
    rating: 5,
    reviews: "1k",
    tags: ["Schreiben", "TestDaF", "B2"],
    achievements: 100,
    certificates: 50,
  },
  {
    id: "tch-06",
    name: "Yves Kagabo",
    photo: photos.yves,
    rating: 5,
    reviews: "1k",
    tags: ["Konversation", "Beruf", "B1"],
    achievements: 100,
    certificates: 50,
  },
];

export const courses: Course[] = [
  {
    slug: "deutsch-a1",
    title: "Deutsch A1 — Anfänger",
    level: "A1",
    levelLabel: "Beginner",
    price: 45000,
    oldPrice: 90000,
    teacher: teachers[0],
    rating: 5,
    reviews: "1k",
    students: "10k",
    lessons: 110,
    lessonsLabel: "110+ Lektionen",
    thumbnail: courseArt.a1,
    summary:
      "Start from zero: alphabet, greetings, numbers, everyday phrases and your first 500 German words. Live evening classes plus downloadable audio notes.",
    outcomes: [
      "Alphabet & Aussprache",
      "Vorstellung & Begrüssung",
      "Zahlen & Uhrzeit",
      "Einkaufen & Restaurant",
      "Präsens & einfache Sätze",
      "Erste 500 Wörter",
    ],
  },
  {
    slug: "deutsch-a2",
    title: "Deutsch A2 — Grundstufe",
    level: "A2",
    levelLabel: "Elementary",
    price: 45000,
    oldPrice: 90000,
    teacher: teachers[1],
    rating: 5,
    reviews: "1k",
    students: "8k",
    lessons: 118,
    lessonsLabel: "118+ Lektionen",
    thumbnail: courseArt.a2,
    summary:
      "Hold simple conversations about work, family and travel. Past tense, Dativ and Akkusativ explained with Rwandan everyday examples.",
    outcomes: [
      "Perfekt & Präteritum",
      "Akkusativ & Dativ",
      "Arbeit & Bewerbung",
      "Reisen & Transport",
      "Telefonieren",
      "Briefe schreiben",
    ],
  },
  {
    slug: "deutsch-b1",
    title: "Deutsch B1 — Mittelstufe",
    level: "B1",
    levelLabel: "Intermediate",
    price: 55000,
    oldPrice: 95000,
    teacher: teachers[2],
    rating: 5,
    reviews: "1k",
    students: "6k",
    lessons: 124,
    lessonsLabel: "124+ Lektionen",
    thumbnail: courseArt.b1,
    summary:
      "Become independent. Discuss opinions, read news articles, prepare for the Goethe B1 exam with weekly mock speaking sessions.",
    outcomes: [
      "Nebensätze & Konnektoren",
      "Meinung & Diskussion",
      "Nachrichten lesen",
      "Prüfungstraining B1",
      "Formelle E-Mails",
      "Bewerbungsgespräch",
    ],
  },
  {
    slug: "deutsch-b2",
    title: "Deutsch B2 — Fortgeschritten",
    level: "B2",
    levelLabel: "Upper Intermediate",
    price: 65000,
    oldPrice: 110000,
    teacher: teachers[3],
    rating: 5,
    reviews: "1k",
    students: "4k",
    lessons: 132,
    lessonsLabel: "132+ Lektionen",
    thumbnail: courseArt.b2,
    summary:
      "University-level German. Academic writing, complex grammar, debates and listening to native speakers at natural speed.",
    outcomes: [
      "Passiv & Konjunktiv",
      "Akademisches Schreiben",
      "Debattieren",
      "Wissenschaftliches Hören",
      "Studium in Deutschland",
      "Prüfungstraining B2",
    ],
  },
  {
    slug: "berufsdeutsch-b1",
    title: "Berufsdeutsch B1 — Pflege & Technik",
    level: "B1",
    levelLabel: "Intermediate",
    price: 60000,
    teacher: teachers[5],
    rating: 5,
    reviews: "640",
    students: "3k",
    lessons: 96,
    lessonsLabel: "96+ Lektionen",
    thumbnail: courseArt.business,
    summary:
      "German for nursing, hospitality and technical jobs. Interview practice, workplace vocabulary and Anerkennung document support.",
    outcomes: [
      "Pflege-Wortschatz",
      "Technik-Wortschatz",
      "Bewerbung & Lebenslauf",
      "Kollegengespräche",
      "Sicherheit am Arbeitsplatz",
      "Vorstellungsgespräch",
    ],
  },
  {
    slug: "testdaf-vorbereitung",
    title: "TestDaF Vorbereitung",
    level: "B2",
    levelLabel: "Advanced",
    price: 70000,
    teacher: teachers[4],
    rating: 5,
    reviews: "420",
    students: "2k",
    lessons: 84,
    lessonsLabel: "84+ Lektionen",
    thumbnail: courseArt.testdaf,
    summary:
      "Focused TestDaF drilling: Leseverstehen, Hörverstehen, Schriftlicher and Mündlicher Ausdruck with full timed mock exams.",
    outcomes: [
      "Leseverstehen Taktik",
      "Hörverstehen Taktik",
      "Schriftlicher Ausdruck",
      "Mündlicher Ausdruck",
      "Zeitmanagement",
      "3 komplette Mock-Prüfungen",
    ],
  },
];

export const popularCategories = [
  {
    id: "cat-1",
    emoji: "📖",
    title: "Grammatik",
    subtitle: "Regeln einfach erklärt",
  },
  {
    id: "cat-2",
    emoji: "🎧",
    title: "Hören",
    subtitle: "Podcasts & Audio-Notizen",
  },
  {
    id: "cat-3",
    emoji: "🗣️",
    title: "Sprechen",
    subtitle: "Live-Konversation",
  },
  {
    id: "cat-4",
    emoji: "✍️",
    title: "Schreiben",
    subtitle: "Briefe & Aufsätze",
  },
];

export const courseReviews: Review[] = [
  {
    id: "rev-1",
    name: "Sandrine Ineza",
    photo: photos.sandrine,
    rating: 5,
    when: "1 Monat her",
    body: "The grammar videos finally made Akkusativ and Dativ simple. I asked questions in the live class and got answers the same evening.",
  },
  {
    id: "rev-2",
    name: "Patrick Mugenzi",
    photo: photos.patrick,
    rating: 5,
    when: "1 Monat her",
    body: "Audio notes download well on a slow connection, so I revise on the bus. The quiz after every lesson keeps me honest.",
  },
];

export const lessonGroups: LessonGroup[] = [
  {
    id: "grp-video",
    title: "Video Lektionen",
    meta: "(1/10)",
    items: [
      { id: "l-1", label: "Einführung", duration: "1:00", state: "current" },
      { id: "l-2", label: "Erste Schritte", duration: "1:00", state: "locked" },
      { id: "l-3", label: "Werkzeuge", duration: "1:00", state: "locked" },
      {
        id: "l-4",
        label: "Werkzeuge installieren",
        duration: "1:00",
        state: "locked",
      },
      { id: "l-5", label: "Plugins", duration: "1:00", state: "locked" },
    ],
  },
  {
    id: "grp-audio",
    title: "Audio Notizen",
    meta: "(1/25)",
    items: [
      {
        id: "a-1",
        label: "Aussprache Training",
        duration: "4:20",
        state: "current",
      },
      {
        id: "a-2",
        label: "Dialog: Im Supermarkt",
        duration: "3:10",
        state: "locked",
      },
      {
        id: "a-3",
        label: "Dialog: Beim Arzt",
        duration: "3:45",
        state: "locked",
      },
    ],
  },
  {
    id: "grp-module",
    title: "Module & Notizen",
    meta: "(1/50)",
    items: [
      {
        id: "m-1",
        label: "Modul 1 — Begrüssung",
        duration: "PDF",
        state: "current",
      },
      {
        id: "m-2",
        label: "Modul 2 — Familie",
        duration: "PDF",
        state: "locked",
      },
      {
        id: "m-3",
        label: "Modul 3 — Wohnen",
        duration: "PDF",
        state: "locked",
      },
    ],
  },
  {
    id: "grp-quiz",
    title: "Quiz & Prüfungen",
    meta: "(1/10)",
    items: [
      {
        id: "q-1",
        label: "Quiz 1 — Artikel",
        duration: "10 Fragen",
        state: "current",
      },
      {
        id: "q-2",
        label: "Quiz 2 — Zahlen",
        duration: "10 Fragen",
        state: "locked",
      },
      {
        id: "q-3",
        label: "Zwischenprüfung A1",
        duration: "40 Fragen",
        state: "locked",
      },
    ],
  },
];

export const upcomingSchedule: ScheduleEvent[] = [
  {
    id: "ev-1",
    title: "Deutsch A2 — Grammatik",
    teacher: "Clarisse Uwase",
    photo: photos.clarisse,
    date: "12 Januar 2025",
    time: "09:00 — 10:00",
    tone: "brand",
    status: "Scheduled",
  },
  {
    id: "ev-2",
    title: "Konversation B1",
    teacher: "Yves Kagabo",
    photo: photos.yves,
    date: "12 Januar 2025",
    time: "09:00 — 10:00",
    tone: "navy",
    status: "Live",
  },
  {
    id: "ev-3",
    title: "Prüfungstraining B1",
    teacher: "Jean-Paul Habimana",
    photo: photos.jeanPaul,
    date: "12 Januar 2025",
    time: "09:00 — 10:00",
    tone: "coral",
    status: "Rescheduled",
  },
];

export const todaySchedule: ScheduleEvent[] = [
  {
    id: "ts-1",
    title: "Aussprache Training",
    teacher: "A1/A2 Gruppe",
    photo: photos.nadine,
    date: "Heute",
    time: "07:00 — 08:00",
    tone: "coral",
    status: "Completed",
  },
  {
    id: "ts-2",
    title: "Konversation A2",
    teacher: "Dialog",
    photo: photos.aline,
    date: "Heute",
    time: "10:00 — 11:00",
    tone: "brand",
    status: "Live",
  },
  {
    id: "ts-3",
    title: "Wortschatz B1",
    teacher: "Fragen & Antworten",
    photo: photos.eric,
    date: "Heute",
    time: "15:00 — 16:00",
    tone: "sun",
    status: "Scheduled",
  },
];

export const ongoingClasses = [
  {
    id: "oc-1",
    title: "Deutsch A2 — Grundstufe",
    progress: 75,
    tone: "brand" as const,
  },
  { id: "oc-2", title: "Berufsdeutsch B1", progress: 50, tone: "sun" as const },
];

export const students: Student[] = [
  {
    id: "SDR-2024-0142",
    name: "Sandrine Ineza",
    photo: photos.sandrine,
    course: "Deutsch A2 — Grundstufe",
    joinDate: "2 Januar 2024",
    status: "Completed",
    accountStatus: "Active",
  },
  {
    id: "SDR-2024-0187",
    name: "Patrick Mugenzi",
    photo: photos.patrick,
    course: "Berufsdeutsch B1",
    joinDate: "2 Januar 2024",
    status: "On Progress",
    accountStatus: "Active",
  },
  {
    id: "SDR-2024-0203",
    name: "Diane Umutoni",
    photo: photos.diane,
    course: "Deutsch A1 — Anfänger",
    joinDate: "2 Januar 2024",
    status: "No Progress",
    accountStatus: "Pending",
  },
  {
    id: "SDR-2024-0211",
    name: "Fabrice Rwigema",
    photo: photos.fabrice,
    course: "TestDaF Vorbereitung",
    joinDate: "14 Februar 2024",
    status: "On Progress",
    accountStatus: "Active",
  },
  {
    id: "SDR-2024-0234",
    name: "Solange Nyirahabimana",
    photo: photos.solange,
    course: "Deutsch B2 — Fortgeschritten",
    joinDate: "14 Februar 2024",
    status: "Completed",
    accountStatus: "Graduated",
  },
  {
    id: "SDR-2024-0255",
    name: "Emmanuel Butera",
    photo: photos.emmanuel,
    course: "Deutsch B1 — Mittelstufe",
    joinDate: "3 März 2024",
    status: "No Progress",
    accountStatus: "Suspended",
  },
];

export const transactions: Transaction[] = [
  {
    id: "tx-1",
    date: "2 Januar 2024",
    name: "Sandrine Ineza",
    amount: 45000,
    status: "Fully Paid",
    invoice: "INV-2024-0142",
    method: "MTN MoMo",
  },
  {
    id: "tx-2",
    date: "2 Januar 2024",
    name: "Patrick Mugenzi",
    amount: 30000,
    status: "Partially Paid",
    invoice: "INV-2024-0187",
    method: "Airtel Money",
  },
  {
    id: "tx-3",
    date: "2 Januar 2024",
    name: "Diane Umutoni",
    amount: 45000,
    status: "Overdue",
    invoice: "INV-2024-0203",
    method: "Bank Transfer",
  },
  {
    id: "tx-4",
    date: "14 Februar 2024",
    name: "Fabrice Rwigema",
    amount: 70000,
    status: "Fully Paid",
    invoice: "INV-2024-0211",
    method: "Card",
  },
  {
    id: "tx-5",
    date: "14 Februar 2024",
    name: "Solange Nyirahabimana",
    amount: 65000,
    status: "Waived",
    invoice: "INV-2024-0234",
    method: "Scholarship",
  },
  {
    id: "tx-6",
    date: "3 März 2024",
    name: "Emmanuel Butera",
    amount: 55000,
    status: "Refunded",
    invoice: "INV-2024-0255",
    method: "MTN MoMo",
  },
];

export const contacts = [
  { id: "ct-1", name: "Clarisse", photo: photos.clarisse },
  { id: "ct-2", name: "Jean-Paul", photo: photos.jeanPaul },
  { id: "ct-3", name: "Aline", photo: photos.aline },
  { id: "ct-4", name: "Eric", photo: photos.eric },
  { id: "ct-5", name: "Yves", photo: photos.yves },
];

export const chatThreads: ChatThread[] = [
  {
    id: "th-1",
    name: "Clarisse Uwase",
    photo: photos.clarisse,
    preview: "Bitte bring die Notizen von Modul 3 mit...",
    time: "12:45 PM",
    unread: 2,
  },
  {
    id: "th-2",
    name: "Yves Kagabo",
    photo: photos.yves,
    preview: "Wir üben morgen das Vorstellungsgespräch...",
    time: "12:45 PM",
    unread: 2,
  },
  {
    id: "th-3",
    name: "Sandrine Ineza",
    photo: photos.sandrine,
    preview: "Danke für die Audio-Dateien!",
    time: "12:45 PM",
  },
  {
    id: "th-4",
    name: "Jean-Paul Habimana",
    photo: photos.jeanPaul,
    preview: "Die Prüfung ist am Freitag um 18:00...",
    time: "12:45 PM",
    unread: 2,
  },
  {
    id: "th-5",
    name: "Nadine Mukamana",
    photo: photos.nadine,
    preview: "Neue Vokabelliste ist hochgeladen...",
    time: "12:45 PM",
    unread: 2,
  },
];

export const chatMessages: ChatMessage[] = [
  { id: "msg-1", from: "them", body: "Hallo Nella!", time: "12:45 PM" },
  {
    id: "msg-2",
    from: "them",
    body: "Kannst du den Unterricht für nächste Woche planen?",
    time: "12:45 PM",
  },
  { id: "msg-3", from: "me", body: "Hallo Clarisse!", time: "12:45 PM" },
  {
    id: "msg-4",
    from: "me",
    body: "Ja, ich mache das heute Abend fertig.",
    time: "12:45 PM",
  },
];

export const sharedFiles = [
  { id: "f-1", name: "Modul-3-Grammatik.pdf", size: "1,5 MB" },
  { id: "f-2", name: "Vokabelliste-A2.pdf", size: "1,5 MB" },
  { id: "f-3", name: "Audio-Dialoge.zip", size: "1,5 MB" },
  { id: "f-4", name: "Pruefung-B1-Probe.pdf", size: "1,5 MB" },
];

export const sharedLinks = [
  { id: "ln-1", name: "goethe.de", time: "13:45 PM" },
  { id: "ln-2", name: "dw.com/deutschlernen", time: "13:45 PM" },
  { id: "ln-3", name: "sparch.rw/bibliothek", time: "13:45 PM" },
  { id: "ln-4", name: "testdaf.de", time: "13:45 PM" },
];

export const activityFeed: ActivityItem[] = [
  {
    id: "ac-1",
    time: "10:10 AM",
    actor: "Sandrine Ineza",
    photo: photos.sandrine,
    action: "hat 2 Dateien in",
    target: "Deutsch A2 Grammatik",
    targetTone: "sun",
    attachments: [
      { name: "Modul3_Grammatik.pdf", size: "1,5 MB" },
      { name: "Modul3_Uebungen.pdf", size: "1,5 MB" },
    ],
  },
  {
    id: "ac-2",
    time: "09:30 AM",
    actor: "Patrick Mugenzi",
    photo: photos.patrick,
    action: "hat dich eingeladen zu",
    target: "Berufsdeutsch Gruppe",
    targetTone: "sun",
  },
  {
    id: "ac-3",
    time: "09:10 AM",
    actor: "Diane Umutoni",
    photo: photos.diane,
    action: "hat deine Einladung angenommen für",
    target: "Deutsch A1 Live-Klasse",
    targetTone: "brand",
  },
  {
    id: "ac-4",
    time: "08:45 AM",
    actor: "Clarisse Uwase",
    photo: photos.clarisse,
    action: "hat dich aus dem Gruppenchat entfernt von",
    target: "B2 Konversation",
    targetTone: "coral",
  },
];

export const activityYesterday: ActivityItem[] = [
  {
    id: "ay-1",
    time: "12:10 AM",
    actor: "Nadine Mukamana",
    photo: photos.nadine,
    action: "hat dich erwähnt in der Diskussion in",
    target: "A1 Aussprache",
    targetTone: "coral",
  },
  {
    id: "ay-2",
    time: "10:40 AM",
    actor: "Eric Nshuti",
    photo: photos.eric,
    action: "hat deinen Beitrag kommentiert in",
    target: "TestDaF Gruppe",
    targetTone: "brand",
  },
  {
    id: "ay-3",
    time: "08:10 AM",
    actor: "Aline Uwimana",
    photo: photos.aline,
    action: "ist beigetreten",
    target: "Deutsch B1 Mittelstufe",
    targetTone: "brand",
  },
];

export const articles: Article[] = [
  {
    id: "ar-1",
    title: "10 Tipps, um schneller Deutsch zu sprechen",
    excerpt:
      "Vom ersten Tag an sprechen, Fehler akzeptieren und täglich zehn Minuten laut wiederholen — so gewinnen A1-Lernende in Kigali schnell Sicherheit.",
    author: "Admin",
    date: "2 Januar 2022",
    image: articleArt.uxTips,
  },
  {
    id: "ar-2",
    title: "Die besten Methoden zum Vokabeln lernen",
    excerpt:
      "Karteikarten, Eselsbrücken und Karteikarten-Apps im Vergleich. Wir zeigen, welcher Rhythmus für Berufstätige im Abendkurs funktioniert.",
    author: "Admin",
    date: "2 Januar 2022",
    image: articleArt.fonts,
  },
  {
    id: "ar-3",
    title: "Goethe B1 Prüfung: der komplette Fahrplan",
    excerpt:
      "Von der Anmeldung bis zum Sprechteil — Zeitplan, Gebühren und die Unterlagen, die du für die Anerkennung in Deutschland brauchst.",
    author: "Admin",
    date: "2 Januar 2022",
    image: articleArt.react,
  },
];

export const faqs: Faq[] = [
  {
    id: "fa-1",
    question: "Gibt es eine kostenlose Probewoche?",
    answer:
      "Ja. Jede Stufe hat zwei kostenlose Einführungslektionen plus einen Platz im Live-Abendkurs, damit du Tempo und Lehrer vor der Zahlung testen kannst.",
  },
  {
    id: "fa-2",
    question: "Wie bezahle ich den Kurs?",
    answer:
      "MTN MoMo, Airtel Money, Banküberweisung oder Karte. Teilzahlungen und Raten sind möglich — der offene Saldo wird automatisch berechnet.",
  },
  {
    id: "fa-3",
    question: "Kann ich Live-Kurse später ansehen?",
    answer:
      "Ja. Jede Live-Klasse wird aufgezeichnet und erscheint danach in deinem Kurs mit Link zum erneuten Ansehen.",
  },
  {
    id: "fa-4",
    question: "Was unterscheidet Free, Konto und Premium?",
    answer:
      "Free enthält die Einführungslektionen, Konto die Notizen und Audio-Dateien, Premium zusätzlich Live-Klassen, Prüfungstraining und Zertifikate.",
  },
];

export const adminDashboard = {
  totalStudents: 12345,
  studentDelta: "5.4%",
  newUsers: 12890,
  courses: 100,
  earnings: 45741,
  performance: 14988,
  impressions: 12890,
};

export const monthlySeries = [
  { month: "Jan", thisWeek: 60, lastWeek: 45 },
  { month: "Feb", thisWeek: 55, lastWeek: 70 },
  { month: "Mar", thisWeek: 62, lastWeek: 60 },
  { month: "Apr", thisWeek: 70, lastWeek: 52 },
  { month: "May", thisWeek: 58, lastWeek: 40 },
  { month: "Jun", thisWeek: 75, lastWeek: 55 },
  { month: "Jul", thisWeek: 88, lastWeek: 45 },
  { month: "Aug", thisWeek: 96, lastWeek: 48 },
  { month: "Sep", thisWeek: 45, lastWeek: 62 },
  { month: "Oct", thisWeek: 38, lastWeek: 68 },
  { month: "Nov", thisWeek: 94, lastWeek: 75 },
  { month: "Dec", thisWeek: 82, lastWeek: 90 },
];

export const weekSeries = [
  { day: "Mon", thisWeek: 40, lastWeek: 62 },
  { day: "Tue", thisWeek: 55, lastWeek: 58 },
  { day: "Wed", thisWeek: 48, lastWeek: 70 },
  { day: "Thu", thisWeek: 72, lastWeek: 55 },
  { day: "Fri", thisWeek: 62, lastWeek: 72 },
  { day: "Sat", thisWeek: 30, lastWeek: 32 },
  { day: "Sun", thisWeek: 78, lastWeek: 40 },
];

export const profileProgress = [
  { day: "Mon", thisWeek: 40, lastWeek: 72 },
  { day: "Tue", thisWeek: 62, lastWeek: 62 },
  { day: "Wed", thisWeek: 48, lastWeek: 24 },
  { day: "Thu", thisWeek: 70, lastWeek: 18 },
  { day: "Fri", thisWeek: 25, lastWeek: 62 },
  { day: "Sat", thisWeek: 92, lastWeek: 45 },
  { day: "Sun", thisWeek: 90, lastWeek: 58 },
];

export const adminWorkingActivity = monthlySeries.map((row) => ({
  month: row.month,
  morning: row.thisWeek,
  evening: row.lastWeek,
  planned: 100,
}));

export const sellingActivity = [
  { week: "W1", selling: 120, insight: 130 },
  { week: "W2", selling: 62, insight: 110 },
  { week: "W3", selling: 68, insight: 92 },
  { week: "W4", selling: 155, insight: 170 },
];

export const popularClasses = [
  { name: "Grammatik", value: 27, color: "#FEC64F" },
  { name: "Konversation", value: 50, color: "#FC6B57" },
  { name: "Prüfung", value: 23, color: "#4CBC9A" },
];

export const popularClassRows = [
  { id: "pc-1", label: "Grammatik (27%)", value: 763, color: "#FEC64F" },
  { id: "pc-2", label: "Konversation (50%)", value: 321, color: "#FC6B57" },
  { id: "pc-3", label: "Prüfung (23%)", value: 69, color: "#4CBC9A" },
];

export const topCourses = [
  { id: "tc-1", label: "Deutsch A2", value: "12.345", tone: "brand" as const },
  {
    id: "tc-2",
    label: "Berufsdeutsch B1",
    value: "13.345",
    tone: "sun" as const,
  },
];

export const liveClass = {
  status: "Live" as const,
  title: "Deutsch A1 — Live Session",
  teacher: "Clarisse Uwase",
  students: "10k",
  photo: photos.clarisse,
  thumbnail: liveClassArt,
  attendees: [photos.sandrine, photos.patrick, photos.diane, photos.fabrice],
  extraAttendees: 76,
};

export const liveChat: ChatMessage[] = [
  {
    id: "lc-1",
    from: "them",
    body: "Ich verstehe den Dativ noch nicht ganz.",
    time: "12:45 PM",
  },
  {
    id: "lc-2",
    from: "me",
    body: "Kein Problem, ich erkläre es gleich nochmal.",
    time: "12:45 PM",
  },
];

export const liveClassContent: LessonGroup[] = [
  {
    id: "lv-1",
    title: "Kapitel 1: Einführung",
    meta: "",
    items: [
      { id: "lvi-1", label: "Einführung", duration: "1:00", state: "done" },
      {
        id: "lvi-2",
        label: "Werkzeuge & Plugins",
        duration: "1:00",
        state: "done",
      },
    ],
  },
  {
    id: "lv-2",
    title: "Kapitel 2: Basis Grammatik",
    meta: "",
    items: [
      {
        id: "lvi-3",
        label: "Artikel & Fälle",
        duration: "1:00",
        state: "current",
      },
      { id: "lvi-4", label: "Satzbau", duration: "1:00", state: "locked" },
    ],
  },
];

export const currentCourses = [
  {
    id: "cc-1",
    label: "Klassenzimmer",
    title: "Deutsch A2 — Grundstufe",
    progress: 80,
    total: "90 / 110",
  },
  {
    id: "cc-2",
    label: "Klassenzimmer",
    title: "Berufsdeutsch B1",
    progress: 62,
    total: "50 / 80",
  },
];

export const userReviews = [
  {
    id: "ur-1",
    name: "Sandrine Ineza",
    photo: photos.sandrine,
    rating: 5,
    body: "Die Live-Klassen sind klein und man spricht wirklich viel.",
  },
  {
    id: "ur-2",
    name: "Patrick Mugenzi",
    photo: photos.patrick,
    rating: 5,
    body: "Notizen und Audio funktionieren auch mit schwachem Netz.",
  },
  {
    id: "ur-3",
    name: "Diane Umutoni",
    photo: photos.diane,
    rating: 5,
    body: "Nach drei Monaten habe ich A1 ohne Probleme bestanden.",
  },
];

/** Decorative clusters and secondary datasets for the admin surfaces. */
export const enrollmentBars = [14, 9, 16, 11, 13, 8, 15];

export const earningsSpark = [
  { value: 32 },
  { value: 28 },
  { value: 40 },
  { value: 36 },
  { value: 52 },
  { value: 44 },
  { value: 60 },
  { value: 58 },
  { value: 66 },
];

export const newUsersSpark = [
  { value: 20 },
  { value: 34 },
  { value: 24 },
  { value: 46 },
  { value: 30 },
  { value: 58 },
  { value: 40 },
  { value: 52 },
];

export const adminUpcomingEvents = [
  {
    date: "5 Jan",
    events: [
      {
        id: "ae-1",
        time: "08.00 AM",
        category: "Deutsch A1",
        title: "Einführung Wortschatz",
        tone: "brand" as const,
      },
      {
        id: "ae-2",
        time: "10.00 AM",
        category: "Grammatik",
        title: "Artikel & Fälle",
        tone: "sun" as const,
      },
      {
        id: "ae-3",
        time: "01.00 PM",
        category: "Aussprache",
        title: "Lautschulung",
        tone: "coral" as const,
      },
    ],
  },
  {
    date: "5 Jan",
    events: [
      {
        id: "ae-4",
        time: "08.00 AM",
        category: "Deutsch B1",
        title: "Textproduktion",
        tone: "brand" as const,
      },
      {
        id: "ae-5",
        time: "11.00 AM",
        category: "Hören",
        title: "Audioverständnis",
        tone: "sun" as const,
      },
      {
        id: "ae-6",
        time: "02.00 PM",
        category: "Prüfung",
        title: "Probe B1",
        tone: "coral" as const,
      },
      {
        id: "ae-7",
        time: "04.00 PM",
        category: "Berufsdeutsch",
        title: "Bewerbungsgespräch",
        tone: "navy" as const,
      },
    ],
  },
];

export const adminTasks = [
  {
    id: "tk-1",
    label: "Meeting",
    day: 1,
    start: 1,
    span: 2,
    tone: "brand" as const,
    note: "08.00 AM",
  },
  {
    id: "tk-2",
    label: "Wortschatz Training",
    day: 3,
    start: 3,
    span: 2,
    tone: "sun" as const,
    note: "10.00 AM",
  },
  {
    id: "tk-3",
    label: "Evaluate A2",
    day: 5,
    start: 5,
    span: 2,
    tone: "coral" as const,
    note: "12.00 PM",
  },
];

export const GANTT_HOURS = ["8 AM", "9 AM", "10 AM", "11 AM", "12 AM"];
export const GANTT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const adminContact = {
  address: "KG 11 Ave, Remera — Kigali, Rwanda",
  phone: "+250 788 456 790",
  email: "lova@support.com",
};

export const activityTabs = ["Following", "You"];
export const activityFilters = ["All Type", "Files", "Mentions", "Groups"];

export const scheduleTimeline = [
  {
    id: "st-1",
    title: "Aussprache Training",
    subtitle: "A1/A2 Gruppe",
    time: "07:00 — 08:00",
    tone: "coral" as const,
    attendees: [photos.nadine, photos.sandrine, photos.patrick, photos.diane],
  },
  {
    id: "st-2",
    title: "Konversation A2",
    subtitle: "Dialog im Alltag",
    time: "11:00 — 12:00",
    tone: "brand" as const,
    attendees: [photos.aline, photos.eric, photos.yves],
  },
  {
    id: "st-3",
    title: "Wortschatz B1",
    subtitle: "Fragen & Antworten",
    time: "15:00 — 16:00",
    tone: "sun" as const,
    attendees: [
      photos.clarisse,
      photos.jeanPaul,
      photos.fabrice,
      photos.solange,
    ],
  },
];

export const calendarLegend = [
  { label: "Grammatik", tone: "brand" as const },
  { label: "Konversation", tone: "coral" as const },
  { label: "Prüfung", tone: "sun" as const },
  { label: "Aussprache", tone: "navy" as const },
];
