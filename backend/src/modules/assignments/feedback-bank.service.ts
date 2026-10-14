import { writeAudit } from "../../lib/audit.js";
import { badRequest, forbidden, notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { ADMIN_ROLES } from "../../lib/roles.js";
import type { AuthUser } from "../../types/auth.js";
import type { FeedbackCommentInput, RubricTemplateInput } from "./feedback-bank.schema.js";

const LIMIT = 500;
const owner = { owner: { select: { firstName: true, lastName: true } } } as const;
const canManage = (actor: AuthUser, ownerId: string): boolean => ownerId === actor.id || ADMIN_ROLES.includes(actor.role);

// Rubric templates: personal, or shared with every teacher. Owners and admins may edit or share.
export async function listRubricTemplates(actor: AuthUser) {
  const rows = await prisma.rubricTemplate.findMany({ where: { OR: [{ ownerId: actor.id }, { isShared: true }] }, include: owner, orderBy: { updatedAt: "desc" } });
  return rows.map((row) => ({ ...row, canEdit: canManage(actor, row.ownerId) }));
}

async function editableTemplate(actor: AuthUser, id: string) {
  const row = await prisma.rubricTemplate.findUnique({ where: { id } });
  if (!row || (row.ownerId !== actor.id && !row.isShared && !ADMIN_ROLES.includes(actor.role))) throw notFound("Rubric template not found");
  if (!canManage(actor, row.ownerId)) throw forbidden("Only the owner or an administrator can change this template");
  return row;
}

export async function createRubricTemplate(actor: AuthUser, input: RubricTemplateInput) {
  if ((await prisma.rubricTemplate.count({ where: { ownerId: actor.id } })) >= LIMIT) throw badRequest("Template limit reached. Delete templates you no longer use");
  const row = await prisma.rubricTemplate.create({ data: { ...input, ownerId: actor.id }, include: owner });
  await writeAudit({ actorId: actor.id, action: "RUBRIC_TEMPLATE_CREATED", entityType: "RubricTemplate", entityId: row.id, after: { title: row.title, isShared: row.isShared } });
  return { ...row, canEdit: true };
}

export async function updateRubricTemplate(actor: AuthUser, id: string, input: RubricTemplateInput) {
  const previous = await editableTemplate(actor, id);
  const row = await prisma.rubricTemplate.update({ where: { id }, data: input, include: owner });
  await writeAudit({ actorId: actor.id, action: "RUBRIC_TEMPLATE_UPDATED", entityType: "RubricTemplate", entityId: id, before: { title: previous.title, isShared: previous.isShared }, after: { title: row.title, isShared: row.isShared } });
  return { ...row, canEdit: true };
}

export async function deleteRubricTemplate(actor: AuthUser, id: string): Promise<void> {
  const previous = await editableTemplate(actor, id);
  await prisma.rubricTemplate.delete({ where: { id } });
  await writeAudit({ actorId: actor.id, action: "RUBRIC_TEMPLATE_DELETED", entityType: "RubricTemplate", entityId: id, before: { title: previous.title, ownerId: previous.ownerId } });
}

// Comment bank: each grader's own reusable feedback, most used first.
export const listFeedbackComments = (actor: AuthUser) =>
  prisma.feedbackComment.findMany({ where: { ownerId: actor.id }, orderBy: [{ usageCount: "desc" }, { updatedAt: "desc" }] });

async function ownComment(actor: AuthUser, id: string) {
  const row = await prisma.feedbackComment.findFirst({ where: { id, ownerId: actor.id } });
  if (!row) throw notFound("Saved comment not found");
  return row;
}

export async function createFeedbackComment(actor: AuthUser, input: FeedbackCommentInput) {
  if ((await prisma.feedbackComment.count({ where: { ownerId: actor.id } })) >= LIMIT) throw badRequest("Comment bank is full. Delete comments you no longer use");
  const row = await prisma.feedbackComment.create({ data: { ...input, ownerId: actor.id } });
  await writeAudit({ actorId: actor.id, action: "FEEDBACK_COMMENT_CREATED", entityType: "FeedbackComment", entityId: row.id });
  return row;
}

export async function updateFeedbackComment(actor: AuthUser, id: string, input: FeedbackCommentInput) {
  await ownComment(actor, id);
  const row = await prisma.feedbackComment.update({ where: { id }, data: input });
  await writeAudit({ actorId: actor.id, action: "FEEDBACK_COMMENT_UPDATED", entityType: "FeedbackComment", entityId: id });
  return row;
}

export async function deleteFeedbackComment(actor: AuthUser, id: string): Promise<void> {
  await ownComment(actor, id);
  await prisma.feedbackComment.delete({ where: { id } });
  await writeAudit({ actorId: actor.id, action: "FEEDBACK_COMMENT_DELETED", entityType: "FeedbackComment", entityId: id });
}

/** Called when a grader inserts a saved comment, so the most useful ones rise to the top. */
export async function useFeedbackComment(actor: AuthUser, id: string) {
  await ownComment(actor, id);
  return prisma.feedbackComment.update({ where: { id }, data: { usageCount: { increment: 1 } } });
}
