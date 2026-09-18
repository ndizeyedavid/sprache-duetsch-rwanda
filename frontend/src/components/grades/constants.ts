export const TABS = ["Grades", "Progression"] as const;
export type GradesTab = (typeof TABS)[number];

export const TYPE_LABEL: Record<string, string> = {
  QUIZ: "Quiz",
  MODULE_TEST: "Module Test",
  FINAL_EXAM: "Final",
  PLACEMENT: "Placement",
};

export const STATUS_TONE: Record<string, string> = {
  GRADED: "badge-success",
  SUBMITTED: "badge-warning",
  IN_PROGRESS: "badge-info",
  missing: "badge-error",
  not_started: "badge-ghost",
};
