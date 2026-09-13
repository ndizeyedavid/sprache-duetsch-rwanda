import type { Request, Response } from "express";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type { CreateClassInput, ListClassQuery, UpdateClassInput } from "./classes.schema.js";
import * as service from "./classes.service.js";

export const list = async (req: Request, res: Response): Promise<void> => {
  const teacherId = req.user?.role === "TEACHER" ? req.user.id : undefined;
  const result = await service.listClasses(validatedQuery<ListClassQuery>(req), teacherId);
  res.json({ success: true, ...result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const classGroup = await service.getClass(id);
  res.json({ success: true, data: classGroup });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const classGroup = await service.createClass(validatedBody<CreateClassInput>(req), actorId(req));
  res.status(201).json({ success: true, data: classGroup });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const classGroup = await service.updateClass(
    id,
    validatedBody<UpdateClassInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: classGroup });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const classGroup = await service.deleteClass(id, actorId(req));
  res.json({ success: true, data: classGroup });
};
