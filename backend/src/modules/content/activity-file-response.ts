import { badRequest } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { asConfig } from "./activity-keys.js";
import { activityFilePrefix,fileNameFromUrl } from "./activity-file-policy.js";

/**
 * A response that references an uploaded file (`{ fileUrl, text? }`) must point
 * at this student's own upload for this activity; the stored response is
 * rebuilt from the verified upload record. Other responses pass through.
 */
export async function normalizeFileResponse(userId: string, activityId: string, response: unknown): Promise<unknown> {
  if (!response || typeof response !== "object" || Array.isArray(response) || !("fileUrl" in response)) return response;
  const input = asConfig(response);
  const name = fileNameFromUrl(input.fileUrl);
  const file = name?.startsWith(activityFilePrefix(activityId)) ? await prisma.uploadedFile.findUnique({ where: { name } }) : null;
  if (!file || file.uploaderId !== userId) throw badRequest("Attach a file you uploaded for this activity");
  const text = typeof input.text === "string" ? input.text.trim().slice(0, 5000) : "";
  const seconds = typeof input.durationSeconds === "number" && Number.isFinite(input.durationSeconds) ? Math.min(Math.max(Math.round(input.durationSeconds), 0), 3600) : null;
  return {
    fileUrl: `/api/uploads/${file.name}`,
    mimeType: file.mimeType,
    ...(text ? { text } : {}),
    ...(seconds !== null ? { durationSeconds: seconds } : {}),
  };
}
