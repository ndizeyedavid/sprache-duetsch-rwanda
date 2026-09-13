import { z } from "zod";
import { idParam, optionalText, paginationQuery } from "../../lib/query.js";

export const createConversationSchema = z.object({
  participantIds: z.array(z.string().min(1)).min(1).max(20),
  title: optionalText(120),
  classGroupId: z.string().min(1).optional(),
});

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export const listMessagesQuerySchema = z.object({
  before: z.string().min(1).optional(),
  ...paginationQuery,
});

export const conversationIdSchema = idParam;

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
