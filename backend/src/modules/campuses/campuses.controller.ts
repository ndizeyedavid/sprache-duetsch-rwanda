import type { Request, Response } from "express";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type { CreateCampusInput, ListCampusQuery, UpdateCampusInput } from "./campuses.schema.js";
import * as service from "./campuses.service.js";

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listCampuses(validatedQuery<ListCampusQuery>(req));
  res.json({ success: true, ...result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const campus = await service.getCampus(id);
  res.json({ success: true, data: campus });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const campus = await service.createCampus(validatedBody<CreateCampusInput>(req), actorId(req));
  res.status(201).json({ success: true, data: campus });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const campus = await service.updateCampus(id, validatedBody<UpdateCampusInput>(req), actorId(req));
  res.json({ success: true, data: campus });
};
