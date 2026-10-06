import type { AttendanceSummary } from './attendance-summary.js';
export const summarizeAttendance = (rows: { status: string }[]): AttendanceSummary => {
  const summary: AttendanceSummary = {
    total: rows.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    percentage: 0,
  };

  for (const row of rows) {
    if (row.status === "PRESENT") summary.present += 1;
    else if (row.status === "ABSENT") summary.absent += 1;
    else if (row.status === "LATE") summary.late += 1;
    else if (row.status === "EXCUSED") summary.excused += 1;
  }

  summary.percentage =
    summary.total > 0
      ? Math.round(((summary.present + summary.late) / summary.total) * 100)
      : 0;

  return summary;
};
