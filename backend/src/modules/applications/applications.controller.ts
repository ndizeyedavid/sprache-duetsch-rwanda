import type { Request,Response } from "express";
import { actorId,validatedBody,validatedParams,validatedQuery } from "../../lib/request.js";
import type {
CreateApplicationInput,
CreateStudentFromApplicationInput,
ListApplicationsQuery,
TransitionApplicationInput,
UpdateApplicationInput,
WaitlistQuery,
} from "./applications.schema.js";
import * as service from "./applications.service.js";

export const create = async (req: Request, res: Response): Promise<void> => {
  const result = await service.createCatalogApplication(validatedBody<CreateApplicationInput>(req));
  res.status(result.duplicate ? 200 : 201).json({ success: true, data: result });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, ...(await service.listApplications(validatedQuery<ListApplicationsQuery>(req))) });
};

export const summary = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await service.applicationSummary(validatedQuery<ListApplicationsQuery>(req)) });
};

export const waitlist = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await service.getWaitlist(validatedQuery<WaitlistQuery>(req)) });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  res.json({ success: true, data: await service.getApplication(id) });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  res.json({ success: true, data: await service.updateApplication(id, validatedBody<UpdateApplicationInput>(req), actorId(req)) });
};

export const transition = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  res.json({ success: true, data: await service.transitionApplication(id, validatedBody<TransitionApplicationInput>(req), actorId(req)) });
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.createStudentFromApplication(id, validatedBody<CreateStudentFromApplicationInput>(req), actorId(req));
  res.status(result.accountCreated ? 201 : 200).json({ success: true, data: result });
};
