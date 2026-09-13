import type { Request, Response } from "express";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type { CreateAnnouncementInput, ListNotificationQuery } from "./notifications.schema.js";
import * as service from "./notifications.service.js";

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listNotifications(
    req.user!.id,
    validatedQuery<ListNotificationQuery>(req),
  );
  res.json({ success: true, ...result });
};

export const unreadCount = async (req: Request, res: Response): Promise<void> => {
  const result = await service.getUnreadCount(req.user!.id);
  res.json({ success: true, data: result });
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const notification = await service.markNotificationRead(req.user!.id, id);
  res.json({ success: true, data: notification });
};

export const readAll = async (req: Request, res: Response): Promise<void> => {
  const result = await service.markAllNotificationsRead(req.user!.id);
  res.json({ success: true, data: result });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deleteNotification(req.user!.id, id);
  res.json({ success: true, data: result });
};

export const announce = async (req: Request, res: Response): Promise<void> => {
  const result = await service.createAnnouncement(
    validatedBody<CreateAnnouncementInput>(req),
    actorId(req),
  );
  res.status(201).json({ success: true, data: result });
};
