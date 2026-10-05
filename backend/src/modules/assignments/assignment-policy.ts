import { badRequest, forbidden } from "../../lib/http-error.js";
interface Policy {
  dueAt: Date | null;
  allowLate: boolean;
  maxSubmissions: number;
  responseType: string;
}
export const checkEditable = (
  assignment: Policy,
  submission: { status: string; revision: number } | null,
  now = new Date(),
): void => {
  if (submission && ["SUBMITTED", "GRADED"].includes(submission.status))
    throw forbidden("Wait for teacher feedback before editing");
  if (submission && submission.revision >= assignment.maxSubmissions)
    throw forbidden("Submission limit reached");
  if (!assignment.allowLate && assignment.dueAt && now > assignment.dueAt)
    throw forbidden("The submission deadline has passed");
};
export const checkResponse = (type: string, text: string, files: { mimeType: string }[]): void => {
  if (type === "TEXT" && !text.trim()) throw badRequest("Write your answer before submitting");
  if (type === "FILE" && !files.length) throw badRequest("Attach your work before submitting");
  if (type === "AUDIO" && !files.some((f) => f.mimeType.startsWith("audio/")))
    throw badRequest("Attach an audio recording before submitting");
  if (type === "MIXED" && !text.trim() && !files.length)
    throw badRequest("Write an answer or attach your work");
};
