export const TABS = ["All", "Upcoming", "Overdue", "Missing", "Done"] as const;
export type AssignmentsTab = (typeof TABS)[number];

export const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not started",
  SUBMITTED: "Submitted",
  GRADED: "Graded",
  IN_PROGRESS: "In progress",
  MISSING: "Missing",
  OVERDUE: "Overdue",
};

export const STATUS_TONE: Record<string, string> = {
  NOT_STARTED: "badge-ghost",
  SUBMITTED: "badge-warning",
  GRADED: "badge-success",
  IN_PROGRESS: "badge-info",
  MISSING: "badge-error",
  OVERDUE: "badge-error",
};
