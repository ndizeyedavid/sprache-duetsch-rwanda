import type { Prisma } from "../generated/prisma/client.js";
import { conflict } from "./http-error.js";
import { prisma } from "./prisma.js";

/** Retry serializable conflicts; callbacks must contain database work only. */
export async function transact<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await prisma.$transaction(work, { isolationLevel: "Serializable", timeout: 30000 });
    } catch (error) {
      const code = (error as { code?: string }).code;
      const sqlCode = (error as { meta?: { code?: string } }).meta?.code;
      if (code !== "P2034" && code !== "P2002" && code !== "40001" && !["40001", "40P01"].includes(sqlCode ?? "")) throw error;
      if (attempt === 3) throw conflict("Another update is in progress. Please retry.");
    }
  }
  throw conflict("Please retry this update.");
}
