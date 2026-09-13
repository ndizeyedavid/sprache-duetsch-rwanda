import type { IconType } from 'react-icons';

export type Role = 'student' | 'admin';

export type NavItem = {
  label: string;
  to: string;
  icon: IconType;
  badge?: number;
};

/** Closed sets from the domain spec — do not extend loosely. */
export type Level = 'A1' | 'A2' | 'B1' | 'B2';

export type PaymentStatus =
  | 'Unpaid'
  | 'Partially Paid'
  | 'Fully Paid'
  | 'Overdue'
  | 'Waived'
  | 'Refunded';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export type AccountStatus =
  | 'Active'
  | 'Pending'
  | 'Suspended'
  | 'Completed'
  | 'Withdrawn'
  | 'Graduated';

export type CourseProgressStatus = 'Completed' | 'On Progress' | 'No Progress';

export type LiveClassStatus = 'Scheduled' | 'Live' | 'Completed' | 'Cancelled' | 'Rescheduled';

export type Tone = 'brand' | 'sun' | 'coral' | 'navy' | 'muted';

export type Teacher = {
  id: string;
  name: string;
  photo: string;
  rating: number;
  reviews: string;
  tags: string[];
  achievements: number;
  certificates: number;
};

export type Course = {
  slug: string;
  title: string;
  level: Level;
  levelLabel: string;
  price: number;
  oldPrice?: number;
  teacher: Teacher;
  rating: number;
  reviews: string;
  students: string;
  lessons: number;
  lessonsLabel: string;
  thumbnail: string;
  summary: string;
  outcomes: string[];
};

export type Student = {
  id: string;
  name: string;
  photo: string;
  course: string;
  joinDate: string;
  status: CourseProgressStatus;
  accountStatus: AccountStatus;
};

export type Transaction = {
  id: string;
  date: string;
  name: string;
  amount: number;
  status: PaymentStatus;
  invoice: string;
  method: string;
};

export type Review = {
  id: string;
  name: string;
  photo: string;
  rating: number;
  when: string;
  body: string;
};

export type ScheduleEvent = {
  id: string;
  title: string;
  teacher: string;
  photo: string;
  date: string;
  time: string;
  tone: Tone;
  status: LiveClassStatus;
};

export type ChatThread = {
  id: string;
  name: string;
  photo: string;
  preview: string;
  time: string;
  unread?: number;
};

export type ChatMessage = {
  id: string;
  from: 'me' | 'them';
  body: string;
  time: string;
};

export type ActivityItem = {
  id: string;
  time: string;
  actor: string;
  photo: string;
  action: string;
  target: string;
  targetTone: Tone;
  attachments?: { name: string; size: string }[];
};

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
};

export type LessonGroup = {
  id: string;
  title: string;
  meta: string;
  items: { id: string; label: string; duration: string; state: 'done' | 'current' | 'locked' }[];
};
