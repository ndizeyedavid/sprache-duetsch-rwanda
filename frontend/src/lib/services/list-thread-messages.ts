import { apiGet } from '.././api';
import type { ChatMessage } from './chat-message';
export function listThreadMessages(conversationId: string): Promise<ChatMessage[]> {
  return apiGet<ChatMessage[]>(`/messages/conversations/${conversationId}/messages?pageSize=100`);
}
