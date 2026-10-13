import type { Request, Response } from "express";
import { validatedBody, validatedParams } from "../../lib/request.js";
import type { FeedbackCommentInput, RubricTemplateInput } from "./feedback-bank.schema.js";
import * as bank from "./feedback-bank.service.js";

const idOf = (req: Request): string => validatedParams<{ id: string }>(req).id;

export const listRubrics = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await bank.listRubricTemplates(req.user!) });
};
export const createRubric = async (req: Request, res: Response): Promise<void> => {
  res.status(201).json({ success: true, data: await bank.createRubricTemplate(req.user!, validatedBody<RubricTemplateInput>(req)) });
};
export const updateRubric = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await bank.updateRubricTemplate(req.user!, idOf(req), validatedBody<RubricTemplateInput>(req)) });
};
export const deleteRubric = async (req: Request, res: Response): Promise<void> => {
  await bank.deleteRubricTemplate(req.user!, idOf(req));
  res.json({ success: true, data: null });
};

export const listComments = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await bank.listFeedbackComments(req.user!) });
};
export const createComment = async (req: Request, res: Response): Promise<void> => {
  res.status(201).json({ success: true, data: await bank.createFeedbackComment(req.user!, validatedBody<FeedbackCommentInput>(req)) });
};
export const updateComment = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await bank.updateFeedbackComment(req.user!, idOf(req), validatedBody<FeedbackCommentInput>(req)) });
};
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  await bank.deleteFeedbackComment(req.user!, idOf(req));
  res.json({ success: true, data: null });
};
export const useComment = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await bank.useFeedbackComment(req.user!, idOf(req)) });
};
