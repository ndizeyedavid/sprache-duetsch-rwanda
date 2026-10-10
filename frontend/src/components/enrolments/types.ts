/** Register filters kept in page state so a filtered view is always shareable by copy. */
export type EnrolmentFilters = {
  query: string;
  levelId: string;
  intakeId: string;
  status: string;
  classGroupId: string;
  /** Active enrolments with no class group — the queue that needs attention. */
  awaitingOnly: boolean;
};

export type RegisterStats = {
  total: number;
  active: number;
  awaitingClass: number;
  closed: number;
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