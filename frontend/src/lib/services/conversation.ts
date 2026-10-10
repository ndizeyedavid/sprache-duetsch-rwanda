import type { ChatMessage } from './chat-message';
import type { ChatParticipant } from './chat-participant';
export type Conversation = {
  id: string;
  title: string | null;
  classGroupId: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  unreadCount: number;
};
