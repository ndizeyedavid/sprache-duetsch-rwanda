import type { Request, Response } from "express";
import { actorId, validatedBody, validatedParams, validatedQuery } from "../../lib/request.js";
import * as service from "./articles.service.js";
import type {
  CreateArticleInput,
  CreateFaqInput,
  ListArticlesQuery,
  UpdateArticleInput,
  UpdateFaqInput,
} from "./articles.schema.js";

const staffView = (req: Request): boolean =>
  req.user?.role === "TEACHER" ||
  req.user?.role === "ACADEMIC_ADMIN" ||
  req.user?.role === "SUPER_ADMIN";

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await service.listArticles(validatedQuery<ListArticlesQuery>(req), staffView(req));
  res.json({ success: true, ...result });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params as { slug: string };
  const article = await service.getArticle(slug, staffView(req));
  res.json({ success: true, data: article });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const article = await service.createArticle(actorId(req), validatedBody<CreateArticleInput>(req));
  res.status(201).json({ success: true, data: article });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const article = await service.updateArticle(id, actorId(req), validatedBody<UpdateArticleInput>(req));
  res.json({ success: true, data: article });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deleteArticle(id, actorId(req));
  res.json({ success: true, data: result });
};

export const listFaqs = async (req: Request, res: Response): Promise<void> => {
  const faqs = await service.listFaqs(staffView(req));
  res.json({ success: true, data: faqs });
};

export const createFaq = async (req: Request, res: Response): Promise<void> => {
  const faq = await service.createFaq(actorId(req), validatedBody<CreateFaqInput>(req));
  res.status(201).json({ success: true, data: faq });
};

export const updateFaq = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const faq = await service.updateFaq(id, actorId(req), validatedBody<UpdateFaqInput>(req));
  res.json({ success: true, data: faq });
};

export const deleteFaq = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const result = await service.deleteFaq(id, actorId(req));
  res.json({ success: true, data: result });
};
