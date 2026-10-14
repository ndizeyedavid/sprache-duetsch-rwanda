import type { Request,Response } from "express";
import { sendCsv } from "../../lib/csv.js";
import { validatedBody,validatedParams,validatedQuery } from "../../lib/request.js";
import { grantExtension,removeExtension } from "./assignment-extensions.js";
import { classLessons } from "./assignment-lessons.js";
import * as management from "./assignment-management.js";
import { overridePenalty,reviewWork } from "./assignment-review.js";
import { getStudentDetail,listStudent } from "./assignment-student.js";
import { saveWork } from "./assignment-submissions.js";
import type { AssignmentInput,DraftInput,ExtensionInput,PenaltyOverrideInput,ReviewInput } from "./assignments.schema.js";
import * as service from "./assignments.service.js";
const idOf = (req: Request): string => validatedParams<{ id: string }>(req).id;
export const listMine = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await listStudent(req.user!.id, validatedQuery<{ lessonId?: string }>(req).lessonId) }); };
export const getMine = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await getStudentDetail(req.user!.id, idOf(req)) }); };
export const draft = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await saveWork(req.user!.id, idOf(req), validatedBody<DraftInput>(req)) }); };
export const submit = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await saveWork(req.user!.id, idOf(req), validatedBody<DraftInput>(req), true) }); };
export const list = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await service.listStaff(req.user!) }); };
export const get = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await service.getStaffDetail(req.user!, idOf(req)) }); };
export const create = async (req: Request, res: Response): Promise<void> => { res.status(201).json({ success: true, data: await service.saveAssignment(req.user!, validatedBody<AssignmentInput>(req)) }); };
export const update = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await service.saveAssignment(req.user!, validatedBody<AssignmentInput>(req), idOf(req)) }); };
export const review = async (req: Request, res: Response): Promise<void> => { const { id, submissionId } = validatedParams<{ id: string; submissionId: string }>(req); res.json({ success: true, data: await reviewWork(req.user!, id, submissionId, validatedBody<ReviewInput>(req)) }); };

export const roster = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await service.getClassRecipients(req.user!, idOf(req)) }); };

export const status = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await management.changeAssignmentStatus(req.user!, idOf(req), validatedBody<{ status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }>(req).status) }); };
export const duplicate = async (req: Request, res: Response): Promise<void> => { res.status(201).json({ success: true, data: await management.duplicateAssignment(req.user!, idOf(req)) }); };
export const remove = async (req: Request, res: Response): Promise<void> => { await management.deleteAssignment(req.user!, idOf(req)); res.json({ success: true, data: null }); };
export const exportResults = async (req: Request, res: Response): Promise<void> => { sendCsv(res, 'assignment-results.csv', await management.assignmentResults(req.user!, idOf(req))); };

type SubmissionParams = { id: string; submissionId: string };
export const penalty = async (req: Request, res: Response): Promise<void> => { const { id, submissionId } = validatedParams<SubmissionParams>(req); res.json({ success: true, data: await overridePenalty(req.user!, id, submissionId, validatedBody<PenaltyOverrideInput>(req)) }); };
export const extend = async (req: Request, res: Response): Promise<void> => { const { id, studentId } = validatedParams<{ id: string; studentId: string }>(req); res.json({ success: true, data: await grantExtension(req.user!, id, studentId, validatedBody<ExtensionInput>(req)) }); };
export const unextend = async (req: Request, res: Response): Promise<void> => { const { id, studentId } = validatedParams<{ id: string; studentId: string }>(req); await removeExtension(req.user!, id, studentId); res.json({ success: true, data: null }); };
export const lessons = async (req: Request, res: Response): Promise<void> => { res.json({ success: true, data: await classLessons(req.user!, idOf(req)) }); };
