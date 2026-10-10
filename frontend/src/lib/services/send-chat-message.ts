import { apiPost } from '.././api';
import type { ChatMessage } from './chat-message';
export function sendChatMessage(conversationId: string, body: string): Promise<ChatMessage> {
  return apiPost<ChatMessage>(`/messages/conversations/${conversationId}/messages`, { body });
}
