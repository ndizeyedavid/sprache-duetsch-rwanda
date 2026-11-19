// Spreadsheet export of the enrolment register as shown (filters applied).
import { toCsv } from '../../lib/csv-download';
import type { EnrollmentRow } from '../../lib/services';
import { money } from '../../lib/services';
import { ACCESS_LABEL } from './constants';

export function enrolmentCsv(rows: EnrollmentRow[], withMoney: boolean): string {
  const header = ['Student ID', 'First name', 'Last name', 'Email', 'Phone', 'Level', 'Intake', 'Campus', 'Class', 'Status',
    'Course access', 'Lessons done', 'Lessons total', 'Last sign-in', 'Enrolled on', ...(withMoney ? ['Tuition', 'Owed'] : [])];
  const lines = rows.map((row) => [
    row.student.studentCode, row.student.user.firstName, row.student.user.lastName, row.student.user.email, row.student.user.phone ?? '',
    row.level.code, row.intake.name, row.campus?.name ?? '', row.classGroup ? `${row.classGroup.name} (${row.classGroup.code})` : '',
    row.status, row.access ? ACCESS_LABEL[row.access] : '', row.progress?.lessonsDone ?? '', row.progress?.lessonsTotal ?? '',
    row.lastLoginAt ? row.lastLoginAt.slice(0, 10) : 'never', row.enrolledAt.slice(0, 10),
    ...(withMoney ? [money(row.totalFee), row.tuition ? money(row.tuition.outstanding) : ''] : []),
  ]);
  return toCsv([header, ...lines]);
}
