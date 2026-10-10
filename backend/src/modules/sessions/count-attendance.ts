import type { AttendanceStatus } from "../../generated/prisma/client.js";
import type { AttendanceCounts } from './attendance-counts.js';
export const countAttendance = (rows: { status: AttendanceStatus }[]): AttendanceCounts => {
  const counts: AttendanceCounts = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: rows.length,
    percentage: 0,
  };

  for (const row of rows) {
    if (row.status === "PRESENT") counts.present += 1;
    else if (row.status === "ABSENT") counts.absent += 1;
    else if (row.status === "LATE") counts.late += 1;
    else if (row.status === "EXCUSED") counts.excused += 1;
  }

  counts.percentage =
    counts.total > 0
      ? Math.round(((counts.present + counts.late) / counts.total) * 10000) / 100
      : 0;

  return counts;
};
