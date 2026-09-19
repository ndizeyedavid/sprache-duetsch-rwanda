import type { Request, Response } from "express";
import { sendCsv } from "../../lib/csv.js";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import type {
  CreateAssessmentInput,
  CreateQuestionInput,
  GradeAttemptInput,
  ListAssessmentQuery,
  ListAttemptQuery,
  ListQuestionQuery,
  MyAssessmentsQuery,
  ReplaceAssessmentQuestionsInput,
  SkillProfileQuery,
  SubmitAttemptInput,
  UpdateAssessmentInput,
  UpdateQuestionInput,
} from "./assessments.schema.js";
import * as service from "./assessments.service.js";

// ---------------------------------------------------------------------------
// Question bank
// ---------------------------------------------------------------------------

export const listQuestions = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listQuestions(validatedQuery<ListQuestionQuery>(req));
  res.json({ success: true, ...result });
};

export const getQuestion = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const question = await service.getQuestion(id);
  res.json({ success: true, data: question });
};

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  const question = await service.createQuestion(
    validatedBody<CreateQuestionInput>(req),
    actorId(req),
  );
  res.status(201).json({ success: true, data: question });
};

export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const question = await service.updateQuestion(
    id,
    validatedBody<UpdateQuestionInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: question });
};

export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deleteQuestion(id, actorId(req));
  res.json({ success: true, data: result });
};

// ---------------------------------------------------------------------------
// Assessments (staff)
// ---------------------------------------------------------------------------

export const listAssessments = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listAssessments(validatedQuery<ListAssessmentQuery>(req));
  res.json({ success: true, ...result });
};

export const getAssessment = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const assessment = await service.getAssessment(id);
  res.json({ success: true, data: assessment });
};

export const createAssessment = async (req: Request, res: Response): Promise<void> => {
  const assessment = await service.createAssessment(
    validatedBody<CreateAssessmentInput>(req),
    actorId(req),
  );
  res.status(201).json({ success: true, data: assessment });
};

export const updateAssessment = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const assessment = await service.updateAssessment(
    id,
    validatedBody<UpdateAssessmentInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: assessment });
};

export const deleteAssessment = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deleteAssessment(id, actorId(req));
  res.json({ success: true, data: result });
};

export const replaceAssessmentQuestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const assessment = await service.replaceAssessmentQuestions(
    id,
    validatedBody<ReplaceAssessmentQuestionsInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: assessment });
};

// ---------------------------------------------------------------------------
// Attempts (staff)
// ---------------------------------------------------------------------------

export const listAttempts = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listAttempts(validatedQuery<ListAttemptQuery>(req));
  res.json({ success: true, ...result });
};

export const getStaffAttempt = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const attempt = await service.getAttemptDetail(id);
  res.json({ success: true, data: attempt });
};

export const exportAttemptsCsv = async (req: Request, res: Response): Promise<void> => {
  sendCsv(res, "attempts.csv", await service.exportAttempts(validatedQuery<ListAttemptQuery>(req)));
};

export const mySkills = async (req: Request, res: Response): Promise<void> => {
  const skills = await service.getMySkillProfile(req.user!.id);
  res.json({ success: true, data: skills });
};

export const studentSkills = async (req: Request, res: Response): Promise<void> => {
  const { studentId } = validatedQuery<SkillProfileQuery>(req);
  const skills = await service.getSkillProfile(studentId);
  res.json({ success: true, data: skills });
};

export const gradeAttempt = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const attempt = await service.gradeAttempt(
    id,
    validatedBody<GradeAttemptInput>(req),
    actorId(req),
  );
  res.json({ success: true, data: attempt });
};

// ---------------------------------------------------------------------------
// Student flows
// ---------------------------------------------------------------------------

export const listMyAssessments = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listMyAssessments(
    req.user!.id,
    validatedQuery<MyAssessmentsQuery>(req),
  );
  res.json({ success: true, ...result });
};

export const getMyAssessment = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const assessment = await service.getMyAssessment(req.user!.id, id);
  res.json({ success: true, data: assessment });
};

export const startAttempt = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const attempt = await service.startAttempt(req.user!.id, id);
  res.status(201).json({ success: true, data: attempt });
};

export const submitAttempt = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.submitAttempt(
    req.user!.id,
    id,
    validatedBody<SubmitAttemptInput>(req),
  );
  res.json({ success: true, data: result });
};

export const listMyAttempts = async (req: Request, res: Response): Promise<void> => {
  const attempts = await service.listMyAttempts(req.user!.id);
  res.json({ success: true, data: attempts });
};

export const getMyAttempt = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const attempt = await service.getMyAttempt(req.user!.id, id);
  res.json({ success: true, data: attempt });
};

export const recordViolation = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const { type } = req.body as { type?: string };
  const result = await service.recordAttemptViolation(req.user!.id, id, type ?? "unknown");
  res.json({ success: true, data: result });
};
