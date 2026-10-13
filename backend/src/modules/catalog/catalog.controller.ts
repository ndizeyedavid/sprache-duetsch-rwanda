import type { Request,Response } from "express";
import { getCatalog } from "./catalog.service.js";

// Five minutes is fresh enough for fees and intake dates and spares slow mobile networks.
const CACHE_SECONDS = 300;

export const catalog = async (_req: Request, res: Response): Promise<void> => {
  const data = await getCatalog();
  res.set("Cache-Control", `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`);
  res.json({ success: true, data });
};
