import type { Request, Response } from "express";
import { unauthorized } from "../../lib/http-error.js";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import * as service from "./activity.service.js";
import type { CreateEventInput, ListFeedQuery } from "./activity.schema.js";

export const feed = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized();
  }
  const result = await service.getFeed(
    req.user.id,
    req.user.role,
    validatedQuery<ListFeedQuery>(req),
  );
  res.json({ success: true, ...result });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const event = await service.createEvent(actorId(req), validatedBody<CreateEventInput>(req));
  res.status(201).json({ success: true, data: event });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deleteEvent(id, actorId(req));
  res.json({ success: true, data: result });
};
