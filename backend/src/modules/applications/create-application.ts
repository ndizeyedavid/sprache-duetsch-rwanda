import { logger } from "../../lib/logger.js";
import type { CreateApplicationInput } from "./applications.schema.js";
import { submitApplication } from "./submit-application.js";

export interface PublicApplicationResult {
  reference: string | null;
  status: string;
  duplicate: boolean;
}

/** Public catalogue application. Honeypot hits get a normal-looking answer and are dropped. */
export async function createCatalogApplication(input: CreateApplicationInput): Promise<PublicApplicationResult> {
  if (input.website?.trim()) {
    logger.warn("Application honeypot triggered; submission discarded");
    return { reference: null, status: "NEW", duplicate: false };
  }
  const result = await submitApplication({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    levelId: input.levelId,
    intakeId: input.intakeId,
    campusId: input.campusId,
    shift: input.shift,
    experience: input.experience,
    message: input.message,
    source: "CATALOG",
  });
  return { reference: result.reference, status: result.status, duplicate: !result.created };
}
