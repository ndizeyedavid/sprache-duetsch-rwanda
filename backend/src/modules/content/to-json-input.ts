import type { Prisma } from "../../generated/prisma/client.js";
export const toJsonInput = (value: unknown): Prisma.InputJsonValue | undefined =>
  value === undefined || value === null ? undefined : value;
