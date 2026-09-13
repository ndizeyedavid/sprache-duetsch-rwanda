import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./messages.controller.js";
import {
  conversationIdSchema,
  createConversationSchema,
  listMessagesQuerySchema,
  sendMessageSchema,
} from "./messages.schema.js";

export const messagesRouter = Router();

messagesRouter.use(requireAuth);

messagesRouter.get("/conversations", asyncHandler(controller.list));
messagesRouter.post(
  "/conversations",
  validate({ body: createConversationSchema }),
  asyncHandler(controller.create),
);
messagesRouter.get("/contacts", asyncHandler(controller.contacts));
messagesRouter.get(
  "/conversations/:id",
  validate({ params: conversationIdSchema }),
  asyncHandler(controller.get),
);
messagesRouter.get(
  "/conversations/:id/messages",
  validate({ params: conversationIdSchema, query: listMessagesQuerySchema }),
  asyncHandler(controller.listThread),
);
messagesRouter.post(
  "/conversations/:id/messages",
  validate({ params: conversationIdSchema, body: sendMessageSchema }),
  asyncHandler(controller.send),
);
messagesRouter.post(
  "/conversations/:id/read",
  validate({ params: conversationIdSchema }),
  asyncHandler(controller.markRead),
);
