/** Pure: how many published, past-due homework items a student never submitted. */
export interface HomeworkDue {
  classGroupId: string;
  dueAt: Date;
  /** Empty means the whole class is assigned. */
  recipientIds: readonly string[];
  /** Students with SUBMITTED / RETURNED / GRADED work. */
  submittedIds: readonly string[];
  extensions: readonly { studentId: string; dueAt: Date }[];
}

export function missingHomeworkCount(rows: readonly HomeworkDue[], studentId: string, classGroupId: string, enrolledAt: Date, now: Date): number {
  return rows.filter(row => {
    if (row.classGroupId !== classGroupId || row.dueAt < enrolledAt) return false;
    if (row.recipientIds.length && !row.recipientIds.includes(studentId)) return false;
    if (row.submittedIds.includes(studentId)) return false;
    const due = row.extensions.find(ext => ext.studentId === studentId)?.dueAt ?? row.dueAt;
    return due < now;
  }).length;
}
