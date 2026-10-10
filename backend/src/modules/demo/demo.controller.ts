import type { Request, Response } from "express";
import { notFound } from "../../lib/http-error.js";
import { listDemoAccounts } from "./demo.service.js";

export const accounts = (_req: Request, res: Response): void => {
  const rows = listDemoAccounts();
  if (!rows) throw notFound("Test accounts are not available");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.json({ success: true, data: rows.map(({ role, email, password }) => ({ role, email, password })) });
};
