/** Public demo logins seeded by backend/prisma/live-demo. Keep emails in sync with live-demo/accounts.ts. */
export const DEMO_PASSWORD = 'Demo2026!';

export type DemoAccount = { email: string; label: string; detail: string; blocked?: boolean };
export type DemoGroup = { title: string; accounts: DemoAccount[] };

export const DEMO_GROUPS: DemoGroup[] = [
  {
    title: 'Staff',
    accounts: [
      { email: 'academic@demo.sparch.rw', label: 'Academic Admin', detail: 'Students, classes, enrolments, admissions, certificates. No finance.' },
      { email: 'finance@demo.sparch.rw', label: 'Finance Admin', detail: 'Charges, payments, discounts, refunds, receipts. No academics.' },
      { email: 'teacher@demo.sparch.rw', label: 'Teacher · A1', detail: 'DEMO A1 evening class: grading, attendance, schedule, people.' },
      { email: 'teacher.b1@demo.sparch.rw', label: 'Teacher · B1', detail: 'DEMO B1 morning class at Kacyiru.' },
    ],
  },
  {
    title: 'Students',
    accounts: [
      { email: 'student@demo.sparch.rw', label: 'A1 · Main student', detail: 'Paid in two instalments: lessons, progress, homework, quiz, messages.' },
      { email: 'partial@demo.sparch.rw', label: 'A1 · Partially paid', detail: 'Half paid: lessons and quizzes stay locked until tuition is settled.' },
      { email: 'paid@demo.sparch.rw', label: 'A1 · Fully paid', detail: 'Paid in full by MTN MoMo, receipt available.' },
      { email: 'unpaid@demo.sparch.rw', label: 'A1 · Unpaid', detail: 'Nothing paid yet, due in two weeks. Content locked.' },
      { email: 'overdue@demo.sparch.rw', label: 'A1 · Overdue', detail: 'Overdue balance and low attendance (at-risk lists). Content locked.' },
      { email: 'waived@demo.sparch.rw', label: 'A1 · Scholarship', detail: 'Full scholarship discount, nothing to pay.' },
      { email: 'b1@demo.sparch.rw', label: 'B1 · Instalments', detail: 'B1 course, both instalments paid, homework waiting for grading.' },
      { email: 'graduate@demo.sparch.rw', label: 'Graduate · Certificate', detail: 'Completed A1, certificate issued and verifiable.' },
      { email: 'pending@demo.sparch.rw', label: 'New · Pending', detail: 'Just registered, waiting for placement and a class.' },
      { email: 'refunded@demo.sparch.rw', label: 'Withdrawn · Refunded', detail: 'Sign-in is blocked: shows the withdrawn message.', blocked: true },
      { email: 'suspended@demo.sparch.rw', label: 'Suspended', detail: 'Sign-in is blocked: shows the suspended message.', blocked: true },
    ],
  },
];
