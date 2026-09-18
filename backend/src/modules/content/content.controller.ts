import type { Request, Response } from "express";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type {
  CreateActivityInput,
  CreateLessonInput,
  CreateMaterialInput,
  CreateModuleInput,
  GradeActivitySubmissionInput,
  ListActivitySubmissionsQuery,
  MyNotesQuery,
  SearchQuery,
  SubmitActivityInput,
  UpdateActivityInput,
  UpdateLessonInput,
  UpdateMaterialInput,
  UpdateModuleInput,
  UpdateProgressInput,
} from "./content.schema.js";
import * as service from "./content.service.js";

const actor = (req: Request) => ({ id: actorId(req), role: req.user?.role });

// ---------------------------------------------------------------------------
// Staff CMS
// ---------------------------------------------------------------------------

export const createModule = async (req: Request, res: Response): Promise<void> => {
  const { levelId } = validatedParams<{ levelId: string }>(req);
  const module = await service.createModule(levelId, validatedBody<CreateModuleInput>(req), actor(req));
  res.status(201).json({ success: true, data: module });
};

export const listModules = async (req: Request, res: Response): Promise<void> => {
  const { levelId } = validatedParams<{ levelId: string }>(req);
  const modules = await service.listModules(levelId);
  res.json({ success: true, data: modules });
};

export const updateModule = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const module = await service.updateModule(id, validatedBody<UpdateModuleInput>(req), actor(req));
  res.json({ success: true, data: module });
};

export const deleteModule = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deleteModule(id, actor(req));
  res.json({ success: true, data: result });
};

export const createLesson = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const lesson = await service.createLesson(id, validatedBody<CreateLessonInput>(req), actor(req));
  res.status(201).json({ success: true, data: lesson });
};

export const getLesson = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const lesson = await service.getLesson(id);
  res.json({ success: true, data: lesson });
};

export const updateLesson = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const lesson = await service.updateLesson(id, validatedBody<UpdateLessonInput>(req), actor(req));
  res.json({ success: true, data: lesson });
};

export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deleteLesson(id, actor(req));
  res.json({ success: true, data: result });
};

export const createMaterial = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const material = await service.createMaterial(id, validatedBody<CreateMaterialInput>(req), actor(req));
  res.status(201).json({ success: true, data: material });
};

export const updateMaterial = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const material = await service.updateMaterial(id, validatedBody<UpdateMaterialInput>(req), actor(req));
  res.json({ success: true, data: material });
};

export const deleteMaterial = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deleteMaterial(id, actor(req));
  res.json({ success: true, data: result });
};

export const createActivity = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const activity = await service.createActivity(id, validatedBody<CreateActivityInput>(req), actor(req));
  res.status(201).json({ success: true, data: activity });
};

export const updateActivity = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const activity = await service.updateActivity(id, validatedBody<UpdateActivityInput>(req), actor(req));
  res.json({ success: true, data: activity });
};

export const deleteActivity = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deleteActivity(id, actor(req));
  res.json({ success: true, data: result });
};

// ---------------------------------------------------------------------------
// Student learning views
// ---------------------------------------------------------------------------

export const myCourses = async (req: Request, res: Response): Promise<void> => {
  const courses = await service.getStudentCourses(req.user?.id ?? "");
  res.json({ success: true, data: courses });
};

export const myLesson = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const lesson = await service.getStudentLesson(req.user?.id ?? "", id);
  res.json({ success: true, data: lesson });
};

export const updateProgress = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const progress = await service.upsertLessonProgress(
    req.user?.id ?? "",
    id,
    validatedBody<UpdateProgressInput>(req),
  );
  res.json({ success: true, data: progress });
};

export const myNotes = async (req: Request, res: Response): Promise<void> => {
  const result = await service.getStudentNotes(req.user?.id ?? "", validatedQuery<MyNotesQuery>(req));
  res.json({ success: true, ...result });
};

export const myAssignments = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getMyAssignments(req.user?.id ?? "");
  res.json({ success: true, data });
};

export const myAssignmentDetail = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const data = await service.getMyAssignmentDetail(req.user?.id ?? "", id);
  res.json({ success: true, data });
};

// ---------------------------------------------------------------------------
// Activity submissions
// ---------------------------------------------------------------------------

export const submitActivity = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.submitActivity(req.user?.id ?? "", id, validatedBody<SubmitActivityInput>(req));
  res.json({ success: true, data: result });
};

export const myActivitySubmission = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.getMyActivitySubmission(req.user?.id ?? "", id);
  res.json({ success: true, data: result });
};

export const myActivitySubmissions = async (req: Request, res: Response): Promise<void> => {
  const { lessonId } = validatedQuery<{ lessonId?: string }>(req);
  const result = await service.listMyActivitySubmissions(req.user?.id ?? "", lessonId);
  res.json({ success: true, data: result });
};

export const listActivitySubmissions = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listActivitySubmissions(actor(req), validatedQuery<ListActivitySubmissionsQuery>(req));
  res.json({ success: true, ...result });
};

export const gradeActivitySubmission = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.gradeActivitySubmission(actor(req), id, validatedBody<GradeActivitySubmissionInput>(req));
  res.json({ success: true, data: result });
};

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export const search = async (req: Request, res: Response): Promise<void> => {
  const result = await service.searchContent(validatedQuery<SearchQuery>(req), {
    id: req.user?.id ?? "",
    role: req.user?.role ?? "STUDENT",
  });
  res.json({ success: true, ...result });
};
