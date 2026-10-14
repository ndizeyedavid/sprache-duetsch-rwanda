import type { StudentDetail } from '../../lib/services/student-detail';

export type TimelineEvent = { key: string; at: string; title: string; detail: string; tone: 'brand' | 'sun' | 'navy' };

/** Milestones already on the record — registration, enrolments, completions, certificates — newest first. */
export function recordTimeline(student: StudentDetail, limit = 8): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { key: 'registered', at: student.createdAt, title: 'Registered', detail: `Student ID ${student.studentCode}`, tone: 'navy' },
  ];
  for (const row of student.enrollments) {
    const where = [row.classGroup?.name, row.intake?.name].filter(Boolean).join(' · ');
    events.push({ key: `enrolled-${row.id}`, at: row.enrolledAt, title: `Enrolled in ${row.level.code}`, detail: where || row.level.title, tone: 'sun' });
    if (row.completedAt) {
      events.push({ key: `completed-${row.id}`, at: row.completedAt, title: `Completed ${row.level.code}`, detail: row.level.title, tone: 'brand' });
    }
  }
  for (const certificate of student.certificates) {
    events.push({ key: `certificate-${certificate.id}`, at: certificate.issuedAt, title: 'Certificate issued', detail: certificate.status === 'REVOKED' ? 'Later revoked' : 'Valid', tone: 'brand' });
  }
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
