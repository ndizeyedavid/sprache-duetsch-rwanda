import { forbidden } from "../../lib/http-error.js";
import { assertTeacherLevel } from "../../lib/teacher-levels.js";
import type { ContentActor } from './content-actor.js';
export const assertCanManageLevel = async (actor: ContentActor, levelId: string): Promise<void> => {
  if (actor.role !== "TEACHER") {
    return;
  }
  if (!actor.id) {
    throw forbidden("Authentication required");
  }
  await assertTeacherLevel(actor.id, levelId);
};
