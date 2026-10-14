import type { Request,Response } from "express";
import { validatedQuery } from "../../lib/request.js";
import type { AtRiskQuery,GradingBacklogQuery,RetentionQuery } from "./analytics.schema.js";
import { getAtRiskStudents } from "./get-at-risk-students.js";
import { getGradingBacklog } from "./get-grading-backlog.js";
import { getRetention } from "./get-retention.js";

const actor = (req: Request) => ({ id: req.user!.id, role: req.user!.role });

export const atRisk = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, ...(await getAtRiskStudents(actor(req), validatedQuery<AtRiskQuery>(req))) });
};

export const retention = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await getRetention(validatedQuery<RetentionQuery>(req)) });
};

export const gradingBacklog = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await getGradingBacklog(actor(req), validatedQuery<GradingBacklogQuery>(req)) });
};
