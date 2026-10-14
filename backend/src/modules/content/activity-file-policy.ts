import { asConfig } from "./activity-keys.js";

export const MAX_ACTIVITY_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_ACTIVITY_FILES_PER_STUDENT = 30;

const AUDIO_TYPES = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"];
const DOCUMENT_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

/** MIME types a student may upload for an activity (empty: the activity takes no files). */
export function acceptedActivityFileTypes(type: string, config: unknown): string[] {
  if (type === "SPEAKING" || type === "PRONUNCIATION") return AUDIO_TYPES;
  if (type === "WRITING" && asConfig(config).isDocumentSubmission === true) return DOCUMENT_TYPES;
  return [];
}

/** Server-chosen storage names tie each upload to one activity: `activity-<activityId>-<uuid>.<ext>`. */
export const activityFilePrefix = (activityId: string) => `activity-${activityId}-`;

const NAME = /^activity-(.+)-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{2,5}$/;

/** The activity id encoded in an activity upload name, or null for any other file. */
export function activityIdFromFileName(name: string): string | null {
  return NAME.exec(name)?.[1] ?? null;
}

/** Storage name from `/api/uploads/<name>` (absolute or relative URL) or a bare name. */
export function fileNameFromUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /(?:^|\/api\/uploads\/)([A-Za-z0-9._-]+)$/.exec(value.trim());
  return match ? match[1] : null;
}
