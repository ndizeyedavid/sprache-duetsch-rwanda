export type StudentAttendanceRow = {
  id: string;
  status: string;
  note: string | null;
  markedAt: string | null;
  session: {
    id: string;
    title: string;
    startAt: string;
    endAt: string;
    status: string;
    classGroup: { id: string; code: string; name: string } | null;
  };
};
