export type AttendanceRecord = {
  id: string;
  status: string;
  note: string | null;
  markedAt: string | null;
  session: { id: string; title: string; startAt: string; endAt: string };
};
