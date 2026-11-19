/** Register filters kept in page state so a filtered view is always shareable by copy. */
export type EnrolmentFilters = {
  query: string;
  levelId: string;
  intakeId: string;
  status: string;
  classGroupId: string;
  campusId: string;
  /** Active enrolments with no class group — the queue that needs attention. */
  awaitingOnly: boolean;
  /** Course access: OPEN (paid), UNPAID, SUSPENDED or CLOSED; blank for all. */
  access: string;
  /** NEVER_SIGNED_IN or NO_LESSONS (signed in but no lesson finished); blank for all. */
  activity: string;
};

export type RegisterStats = {
  total: number;
  active: number;
  awaitingClass: number;
  closed: number;
  /** Active enrolments whose course is locked until tuition is paid. */
  unpaid: number;
  /** Active enrolments whose student has never signed in. */
  neverSignedIn: number;
};

export type CreateEnrolmentPayload = {
  studentId: string;
  levelId: string;
  intakeId: string;
  classGroupId?: string;
  totalFee?: number;
  installments?: { amount: number; dueDate: string }[];
  windowOverrideReason?: string;
};

/** Blank classGroupId means "remove the class assignment"; undefined means "leave as is". */
export type UpdateEnrolmentPatch = {
  classGroupId?: string | null;
  status?: string;
  totalFee?: number;
  installments?: { amount: number; dueDate: string }[];
  windowOverrideReason?: string;
};