import type { Request, Response } from "express";
import { sendCsv } from "../../lib/csv.js";
import { unauthorized } from "../../lib/http-error.js";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type { ListStudentsQuery, PlacementInput, UpdateStudentInput } from "./students.schema.js";
import * as service from "./students.service.js";

const currentUserId = (req: Request): string => {
  const id = req.user?.id;
  if (!id) {
    throw unauthorized();
  }
  return id;
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getMyProfile(currentUserId(req));
  res.json({ success: true, data });
};

export const myAttendance = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getMyAttendance(currentUserId(req));
  res.json({ success: true, data });
};

export const myProgress = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getMyProgress(currentUserId(req));
  res.json({ success: true, data });
};

export const myPeople = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getMyPeople(currentUserId(req));
  res.json({ success: true, data });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listStudents(validatedQuery<ListStudentsQuery>(req));
  res.json({ success: true, ...result });
};

export const exportCsv = async (req: Request, res: Response): Promise<void> => {
  sendCsv(res, "students.csv", await service.exportStudents(validatedQuery<ListStudentsQuery>(req)));
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.getStudent(id);
  res.json({ success: true, data });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.updateStudent(id, validatedBody<UpdateStudentInput>(req), actorId(req));
  res.json({ success: true, data });
};

export const placement = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.runPlacement(id, validatedBody<PlacementInput>(req), actorId(req));
  res.json({ success: true, data });
};
