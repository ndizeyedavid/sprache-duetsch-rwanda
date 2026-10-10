import { apiPost } from '.././api';
export function markConversationRead(conversationId: string): Promise<unknown> {
  return apiPost(`/messages/conversations/${conversationId}/read`, {});
}
