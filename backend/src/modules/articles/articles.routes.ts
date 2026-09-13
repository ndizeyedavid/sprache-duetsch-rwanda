import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { ACADEMIC_ROLES } from "../../lib/roles.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./articles.controller.js";
import {
  articleIdSchema,
  createArticleSchema,
  createFaqSchema,
  faqIdSchema,
  listArticlesQuerySchema,
  updateArticleSchema,
  updateFaqSchema,
} from "./articles.schema.js";

export const articlesRouter = Router();

// Public catalogue: prospective students can read published posts and FAQs.
articlesRouter.get("/articles", validate({ query: listArticlesQuerySchema }), asyncHandler(controller.list));
articlesRouter.get("/articles/:slug", asyncHandler(controller.get));
articlesRouter.get("/faqs", asyncHandler(controller.listFaqs));

articlesRouter.post(
  "/articles",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ body: createArticleSchema }),
  asyncHandler(controller.create),
);
articlesRouter.patch(
  "/articles/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: articleIdSchema, body: updateArticleSchema }),
  asyncHandler(controller.update),
);
articlesRouter.delete(
  "/articles/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: articleIdSchema }),
  asyncHandler(controller.remove),
);

articlesRouter.post(
  "/faqs",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ body: createFaqSchema }),
  asyncHandler(controller.createFaq),
);
articlesRouter.patch(
  "/faqs/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: faqIdSchema, body: updateFaqSchema }),
  asyncHandler(controller.updateFaq),
);
articlesRouter.delete(
  "/faqs/:id",
  requireAuth,
  requireRole(...ACADEMIC_ROLES),
  validate({ params: faqIdSchema }),
  asyncHandler(controller.deleteFaq),
);
