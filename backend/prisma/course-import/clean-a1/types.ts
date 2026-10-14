export type Kind = "module" | "lesson" | "activity" | "material" | "assessment" | "question" | "assignment";
/** delete: no student work · unpublish: has work, hide it · republish: imported A1 record that was hidden · keep: no change. */
export type Action = "delete" | "unpublish" | "republish" | "keep";
export type Step = { kind: Kind; id: string; title: string; action: Action; reason: string };

export type Steps = Step[];

export const workLabel = (counts: Record<string, number>) =>
  Object.entries(counts).filter(([, n]) => n > 0).map(([label, n]) => `${n} ${label}`).join(", ");
