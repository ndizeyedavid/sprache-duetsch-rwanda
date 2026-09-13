import type { Request, Response } from "express";
import { sendCsv } from "../../lib/csv.js";
import { unauthorized } from "../../lib/http-error.js";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type {
  AttendanceSummaryQuery,
  CancelSessionInput,
  CreateSessionInput,
  CreateSessionMaterialInput,
  ListSessionsQuery,
  MarkAttendanceInput,
  RescheduleSessionInput,
  StudentSessionsQuery,
  UpdateAttendanceInput,
  UpdateSessionInput,
} from "./sessions.schema.js";
import * as service from "./sessions.service.js";

const currentUserId = (req: Request): string => {
  const id = req.user?.id;
  if (!id) {
    throw unauthorized();
  }
  return id;
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const actor = req.user;
  const forcedTeacherId = actor?.role === "TEACHER" ? actor.id : undefined;
  const result = await service.listSessions(validatedQuery<ListSessionsQuery>(req), forcedTeacherId);
  res.json({ success: true, ...result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.getSession(id);
  res.json({ success: true, data });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const data = await service.createSession(
    validatedBody<CreateSessionInput>(req),
    actorId(req),
    req.user?.role,
  );
  res.status(201).json({ success: true, data });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.updateSession(
    id,
    validatedBody<UpdateSessionInput>(req),
    actorId(req),
    req.user?.role,
  );
  res.json({ success: true, data });
};

export const cancel = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.cancelSession(
    id,
    validatedBody<CancelSessionInput>(req),
    actorId(req),
    req.user?.role,
  );
  res.json({ success: true, data });
};

export const reschedule = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.rescheduleSession(
    id,
    validatedBody<RescheduleSessionInput>(req),
    actorId(req),
    req.user?.role,
  );
  res.json({ success: true, data });
};

export const addMaterial = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.addSessionMaterial(
    id,
    validatedBody<CreateSessionMaterialInput>(req),
    actorId(req),
    req.user?.role,
  );
  res.status(201).json({ success: true, data });
};

export const deleteMaterial = async (req: Request, res: Response): Promise<void> => {
  const { materialId } = validatedParams<{ materialId: string }>(req);
  const data = await service.deleteSessionMaterial(materialId, actorId(req), req.user?.role);
  res.json({ success: true, data });
};

export const roster = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.getSessionRoster(id);
  res.json({ success: true, data });
};

export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.markAttendance(
    id,
    validatedBody<MarkAttendanceInput>(req),
    actorId(req),
    req.user?.role,
  );
  res.json({ success: true, data });
};

export const updateAttendanceRecord = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.updateAttendance(
    id,
    validatedBody<UpdateAttendanceInput>(req),
    actorId(req),
    req.user?.role,
  );
  res.json({ success: true, data });
};

export const myUpcoming = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getMyUpcomingSessions(currentUserId(req));
  res.json({ success: true, data });
};

export const mySessions = async (req: Request, res: Response): Promise<void> => {
  const result = await service.getMySessions(
    currentUserId(req),
    validatedQuery<StudentSessionsQuery>(req),
  );
  res.json({ success: true, ...result });
};

export const mySession = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.getMySession(currentUserId(req), id);
  res.json({ success: true, data });
};

export const attendanceSummary = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getAttendanceSummary(validatedQuery<AttendanceSummaryQuery>(req), {
    id: currentUserId(req),
    role: req.user?.role ?? "STUDENT",
  });
  res.json({ success: true, data });
};

export const myAttendance = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getMyAttendance(currentUserId(req));
  res.json({ success: true, data });
};

export const exportAttendanceCsv = async (req: Request, res: Response): Promise<void> => {
  const rows = await service.exportAttendance(validatedQuery<AttendanceSummaryQuery>(req), {
    id: currentUserId(req),
    role: req.user?.role ?? "STUDENT",
  });
  sendCsv(res, "attendance.csv", rows);
};
