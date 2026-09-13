import type { Request, Response } from "express";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type { CreateIntakeInput, ListIntakeQuery, UpdateIntakeInput } from "./intakes.schema.js";
import * as service from "./intakes.service.js";

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listIntakes(validatedQuery<ListIntakeQuery>(req));
  res.json({ success: true, ...result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const intake = await service.getIntake(id);
  res.json({ success: true, data: intake });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const intake = await service.createIntake(validatedBody<CreateIntakeInput>(req), actorId(req));
  res.status(201).json({ success: true, data: intake });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const intake = await service.updateIntake(id, validatedBody<UpdateIntakeInput>(req), actorId(req));
  res.json({ success: true, data: intake });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const intake = await service.deleteIntake(id, actorId(req));
  res.json({ success: true, data: intake });
};
