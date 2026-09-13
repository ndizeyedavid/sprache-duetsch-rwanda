import type { Request, Response } from "express";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type { CreateLevelInput, ListLevelQuery, UpdateLevelInput } from "./levels.schema.js";
import * as service from "./levels.service.js";

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listLevels(validatedQuery<ListLevelQuery>(req));
  res.json({ success: true, ...result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const level = await service.getLevel(id);
  res.json({ success: true, data: level });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const level = await service.createLevel(validatedBody<CreateLevelInput>(req), actorId(req));
  res.status(201).json({ success: true, data: level });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const level = await service.updateLevel(id, validatedBody<UpdateLevelInput>(req), actorId(req));
  res.json({ success: true, data: level });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const level = await service.deleteLevel(id, actorId(req));
  res.json({ success: true, data: level });
};
