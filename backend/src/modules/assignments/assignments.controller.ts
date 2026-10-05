import type { Request, Response } from "express";
import { validatedBody, validatedParams } from "../../lib/request.js";
import type { AssignmentInput, DraftInput, ReviewInput } from "./assignments.schema.js";
import * as service from "./assignments.service.js";
import { reviewWork, saveWork } from "./assignment-submissions.js";
const idOf = (req: Request): string => validatedParams<{ id: string }>(req).id;
export const listMine = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await service.listStudent(req.user!.id) }); };
export const getMine = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await service.getStudentDetail(req.user!.id, idOf(req)) }); };
export const draft = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await saveWork(req.user!.id, idOf(req), validatedBody<DraftInput>(req)) }); };
export const submit = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await saveWork(req.user!.id, idOf(req), validatedBody<DraftInput>(req), true) }); };
export const list = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await service.listStaff(req.user!) }); };
export const get = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await service.getStaffDetail(req.user!, idOf(req)) }); };
export const create = async (req: Request, res: Response): Promise<void> => { res.status(201).json({ success: true, data: await service.saveAssignment(req.user!, validatedBody<AssignmentInput>(req)) }); };
export const update = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await service.saveAssignment(req.user!, validatedBody<AssignmentInput>(req), idOf(req)) }); };
export const review = async (req: Request, res: Response): Promise<void> => { const { id, submissionId } = validatedParams<{ id: string; submissionId: string }>(req); res.json({ success: true, data: await reviewWork(req.user!, id, submissionId, validatedBody<ReviewInput>(req)) }); };

export const roster = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await service.getClassRecipients(req.user!, idOf(req)) }); };
