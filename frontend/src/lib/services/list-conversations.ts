import { apiGet } from '.././api';
import type { Conversation } from './conversation';
export function listConversations(): Promise<Conversation[]> {
  return apiGet<Conversation[]>('/messages/conversations');
}
