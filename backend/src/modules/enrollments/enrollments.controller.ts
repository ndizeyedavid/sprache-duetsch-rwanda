import type { Request, Response } from "express";
import { unauthorized } from "../../lib/http-error.js";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type {
  CreateEnrollmentInput,
  ListEnrollmentsQuery,
  UpdateEnrollmentInput,
} from "./enrollments.schema.js";
import * as service from "./enrollments.service.js";

const currentUserId = (req: Request): string => {
  const id = req.user?.id;
  if (!id) {
    throw unauthorized();
  }
  return id;
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getMyEnrollments(currentUserId(req));
  res.json({ success: true, data });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listEnrollments(validatedQuery<ListEnrollmentsQuery>(req));
  res.json({ success: true, ...result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.getEnrollment(id);
  res.json({ success: true, data });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const data = await service.createEnrollment(
    validatedBody<CreateEnrollmentInput>(req),
    actorId(req),
  );
  res.status(201).json({ success: true, data });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.updateEnrollment(
    id,
    validatedBody<UpdateEnrollmentInput>(req),
    actorId(req),
  );
  res.json({ success: true, data });
};
