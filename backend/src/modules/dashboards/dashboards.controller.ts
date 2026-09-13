import type { Request, Response } from "express";
import { validatedQuery } from "../../lib/request.js";
import type { DashboardFilter } from "./dashboards.schema.js";
import * as service from "./dashboards.service.js";

export const student = async (req: Request, res: Response): Promise<void> => {
  const dashboard = await service.getStudentDashboard(
    req.user!.id,
    validatedQuery<DashboardFilter>(req),
  );
  res.json({ success: true, data: dashboard });
};

export const teacher = async (req: Request, res: Response): Promise<void> => {
  const dashboard = await service.getTeacherDashboard(
    req.user!.id,
    req.user!.role,
    validatedQuery<DashboardFilter>(req),
  );
  res.json({ success: true, data: dashboard });
};

export const academic = async (req: Request, res: Response): Promise<void> => {
  const dashboard = await service.getAcademicDashboard(validatedQuery<DashboardFilter>(req));
  res.json({ success: true, data: dashboard });
};

export const finance = async (req: Request, res: Response): Promise<void> => {
  const dashboard = await service.getFinanceDashboard(validatedQuery<DashboardFilter>(req));
  res.json({ success: true, data: dashboard });
};

export const management = async (req: Request, res: Response): Promise<void> => {
  const dashboard = await service.getManagementDashboard(validatedQuery<DashboardFilter>(req));
  res.json({ success: true, data: dashboard });
};
