export type SessionItem = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  timezone: string | null;
  mode: string;
  provider: string | null;
  status: string;
  meetingUrl: string | null;
  room?: string | null;
  notes?: string | null;
  recordingUrl?: string | null;
  teacher: { firstName: string; lastName: string } | null;
  classGroup: { id: string; name: string } | null;
};
