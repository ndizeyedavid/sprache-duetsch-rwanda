/** Public demo logins (empty accounts on production since 2026-10-19). Keep emails in sync with live-demo/accounts.ts. */
export const DEMO_PASSWORD = 'Demo2026!';

export type DemoAccount = { email: string; label: string; detail: string; blocked?: boolean };
export type DemoGroup = { title: string; accounts: DemoAccount[] };

export const DEMO_GROUPS: DemoGroup[] = [
  {
    title: 'Staff',
    accounts: [
      { email: 'admin@demo.sparch.rw', label: 'Super Admin', detail: 'Full administration: accounts, academics, finance and configuration.' },
      { email: 'academic@demo.sparch.rw', label: 'Academic Admin', detail: 'Students, classes, enrolments, admissions, certificates. No finance.' },
      { email: 'finance@demo.sparch.rw', label: 'Finance Admin', detail: 'Charges, payments, discounts, refunds, receipts. No academics.' },
      { email: 'teacher@demo.sparch.rw', label: 'Teacher', detail: 'Empty teacher account: assign levels, intakes and classes from the admin side.' },
    ],
  },
  {
    title: 'Students',
    accounts: [
      { email: 'student@demo.sparch.rw', label: 'Student', detail: 'Empty student account: no enrolments, class or payments yet.' },
    ],
  },
];
