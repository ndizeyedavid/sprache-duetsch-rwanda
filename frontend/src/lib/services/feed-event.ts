export type FeedEvent = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  actorId: string | null;
  actorName: string | null;
  actorAvatarUrl?: string | null;
  createdAt: string;
};
