import { apiPost } from '.././api';
import type { Conversation } from './conversation';
export async function createConversation(body: {
  participantIds: string[];
  title?: string;
}): Promise<Conversation> {
  const conversation = await apiPost<Omit<Conversation, 'messages' | 'unreadCount'> &
    Partial<Pick<Conversation, 'messages' | 'unreadCount'>>>('/messages/conversations', body);
  // Creation (including reused chats) returns participants without message metadata.
  return { ...conversation, messages: conversation.messages ?? [], unreadCount: conversation.unreadCount ?? 0 };
}
