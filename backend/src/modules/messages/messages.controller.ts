import type { Request, Response } from "express";
import { unauthorized } from "../../lib/http-error.js";
import { validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import * as service from "./messages.service.js";
import type {
  CreateConversationInput,
  ListMessagesQuery,
  SendMessageInput,
} from "./messages.schema.js";

const requesterId = (req: Request): string => {
  if (!req.user) {
    throw unauthorized();
  }
  return req.user.id;
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const conversations = await service.listConversations(requesterId(req));
  res.json({ success: true, data: conversations });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const conversation = await service.createConversation(
    requesterId(req),
    validatedBody<CreateConversationInput>(req),
  );
  res.status(201).json({ success: true, data: conversation });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const conversation = await service.getConversation(requesterId(req), id);
  res.json({ success: true, data: conversation });
};

export const listThread = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const messages = await service.listMessages(
    requesterId(req),
    id,
    validatedQuery<ListMessagesQuery>(req),
  );
  res.json({ success: true, data: messages });
};

export const send = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const { body } = validatedBody<SendMessageInput>(req);
  const message = await service.sendMessage(requesterId(req), id, body);
  res.status(201).json({ success: true, data: message });
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.markConversationRead(requesterId(req), id);
  res.json({ success: true, data: result });
};

export const contacts = async (req: Request, res: Response): Promise<void> => {
  const rows = await service.listContacts(requesterId(req));
  res.json({ success: true, data: rows });
};
