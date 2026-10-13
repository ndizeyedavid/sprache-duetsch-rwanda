import type { NextFunction, Request, Response } from "express";
import path from "node:path";
import { badRequest, notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { getStaffAssignment, getStudentAssignment } from "./assignment-access.js";
import { checkEditable } from "./assignment-policy.js";
import { directory, storeAssignmentFile } from "./assignment-storage.js";

const uploadLimit = async (assignmentId: string, uploaderId: string, max: number): Promise<void> => {
  if ((await prisma.assignmentFile.count({ where: { assignmentId, uploaderId } })) >= max)
    throw badRequest("Attachment limit reached. Contact your teacher");
};

/** Student attachment for their own work, while the submission is still editable. */
export const receiveFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { assignment, profile } = await getStudentAssignment(req.user!.id, id);
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId: id, studentId: profile.studentId } },
    });
    checkEditable(assignment, submission);
    if (assignment.responseType === "TEXT") throw badRequest("This assignment accepts text only");
    await uploadLimit(id, req.user!.id, 100);
    storeAssignmentFile(req, res, next, { assignmentId: id, uploaderId: req.user!.id, audioOnly: assignment.responseType === "AUDIO" });
  } catch (e) {
    next(e);
  }
};

/** Teacher's recorded or uploaded audio feedback. Linked to a submission when the review is sent. */
export const receiveFeedbackAudio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await getStaffAssignment(req.user!, id);
    await uploadLimit(id, req.user!.id, 500);
    storeAssignmentFile(req, res, next, { assignmentId: id, uploaderId: req.user!.id, audioOnly: true });
  } catch (e) {
    next(e);
  }
};

const isFeedbackAudio = async (fileId: string, where: { assignmentId: string; studentId?: string }): Promise<boolean> =>
  !!(await prisma.assignmentSubmission.findFirst({
    where: { ...where, OR: [{ feedbackAudioFileId: fileId }, { versions: { some: { feedbackAudioFileId: fileId } } }] },
    select: { id: true },
  }));

export const downloadAttachment = async (req: Request, res: Response): Promise<void> => {
  const file = await prisma.assignmentFile.findUnique({ where: { id: req.params.fileId as string } });
  if (!file || file.assignmentId !== req.params.id) throw notFound("Attachment not found");
  if (req.user!.role === "STUDENT") {
    // Students reach their own uploads and the audio feedback on their own work only.
    const { profile } = await getStudentAssignment(req.user!.id, file.assignmentId);
    if (file.uploaderId !== req.user!.id && !(await isFeedbackAudio(file.id, { assignmentId: file.assignmentId, studentId: profile.studentId })))
      throw notFound("Attachment not found");
  } else {
    await getStaffAssignment(req.user!, file.assignmentId);
    const submitted = await prisma.assignmentVersion.findFirst({
      where: { fileIds: { has: file.id }, submission: { assignmentId: file.assignmentId } },
      select: { id: true },
    });
    if (!submitted && file.uploaderId !== req.user!.id && !(await isFeedbackAudio(file.id, { assignmentId: file.assignmentId })))
      throw notFound("Only submitted attachments can be downloaded");
  }
  res.setHeader("Cache-Control", "private, no-store");
  await new Promise<void>((resolve, reject) =>
    res.download(path.join(directory, file.storageName), file.originalName, (e) => (e ? reject(e) : resolve())),
  );
};
