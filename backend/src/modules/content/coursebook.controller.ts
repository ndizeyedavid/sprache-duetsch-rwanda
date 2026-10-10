import type { Request,Response } from "express";
import { notFound } from "../../lib/http-error.js";
import { actorId,validatedParams } from "../../lib/request.js";
import { getCoursebook } from "./coursebook.service.js";

export const coursebookInfo = async (req: Request, res: Response): Promise<void> => {
  const { levelId } = validatedParams<{ levelId: string }>(req);
  const book = await getCoursebook(actorId(req), levelId);
  res.json({ success: true, data: book ? { filename: book.filename, pages: book.pages, sizeBytes: book.sizeBytes } : null });
};

export const coursebookPdf = async (req: Request, res: Response): Promise<void> => {
  const { levelId } = validatedParams<{ levelId: string }>(req);
  const book = await getCoursebook(actorId(req), levelId);
  if (!book) throw notFound("No coursebook is available for this level");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${book.filename}"`);
  res.setHeader("Cache-Control", "private, no-store");
  await new Promise<void>((resolve, reject) => {
    res.sendFile(book.path, { cacheControl: false }, error => error ? reject(error) : resolve());
  });
};
