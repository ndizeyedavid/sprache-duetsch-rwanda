// When a class may be deleted outright (vs cancelled, which keeps it on record).

export type DeletableSession = { status: string; endAt: Date; attendanceCount: number };

/** Returns why the class must not be deleted, or null when deleting is safe. */
export function deleteProblem(session: DeletableSession): string | null {
  if (session.attendanceCount > 0) return "This class has attendance records. Cancel it instead so the records are kept.";
  if (session.status === "LIVE") return "This class is live right now. Complete or cancel it instead.";
  if (session.status === "COMPLETED") return "Completed classes stay on record. They cannot be deleted.";
  return null;
}

/** Students only hear about removals of classes they were still expecting. */
export const shouldNotifyRemoval = (session: { status: string; endAt: Date }, now = new Date()) =>
  session.status !== "CANCELLED" && session.endAt > now;
