export type ChatParticipant = {
  userId: string;
  lastReadAt: string | null;
  user: { id: string; firstName: string; lastName: string; role: string };
};
