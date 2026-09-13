import type { Request, Response } from "express";
import { unauthorized } from "../../lib/http-error.js";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type {
  CreateUserInput,
  ListUserQuery,
  ResetUserPasswordInput,
  UpdateUserInput,
  UpdateUserRoleInput,
} from "./users.schema.js";
import * as service from "./users.service.js";

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listUsers(validatedQuery<ListUserQuery>(req));
  res.json({ success: true, ...result });
};

export const listTeachers = async (_req: Request, res: Response): Promise<void> => {
  const teachers = await service.listTeachers();
  res.json({ success: true, data: teachers });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const user = await service.getUser(id);
  res.json({ success: true, data: user });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized();
  }
  const user = await service.createUser(
    validatedBody<CreateUserInput>(req),
    req.user.role,
    actorId(req),
  );
  res.status(201).json({ success: true, data: user });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const user = await service.updateUser(id, validatedBody<UpdateUserInput>(req), actorId(req));
  res.json({ success: true, data: user });
};

export const updateRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const user = await service.updateUserRole(
    id,
    validatedBody<UpdateUserRoleInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: user });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  await service.resetUserPassword(id, validatedBody<ResetUserPasswordInput>(req), actorId(req));
  res.json({ success: true, data: { message: "Password has been reset" } });
};
