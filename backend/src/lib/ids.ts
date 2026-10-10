import { createHash,randomBytes } from "node:crypto";
import type { Prisma } from "../generated/prisma/client.js";

// Any Prisma client or interactive-transaction client can run these generators.
type PrismaExecutor = Prisma.TransactionClient;

const pad = (value: number, size = 4): string => String(value).padStart(size, "0");

export const dateStamp = (date: Date = new Date()): string =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1, 2)}${pad(date.getUTCDate(), 2)}`;

// Persistent atomic counters reserve each human-facing identifier exactly once.
// Deleting or voiding a record does not reduce its prefix counter.
const nextNumber = async (tx: PrismaExecutor, prefix: string): Promise<string> => {
  const counter = await tx.identifierCounter.upsert({
    where: { prefix }, create: { prefix, value: 1 }, update: { value: { increment: 1 } },
  });
  return `${prefix}${pad(counter.value)}`;
};
export const generateStudentCode = (tx: PrismaExecutor, when = new Date()): Promise<string> =>
  nextNumber(tx, `SDR-${when.getUTCFullYear()}-`);
export const generateReceiptNumber = (tx: PrismaExecutor, when = new Date()): Promise<string> =>
  nextNumber(tx, `RCP-${dateStamp(when)}-`);
export const generateCertificateNumber = (tx: PrismaExecutor, when = new Date()): Promise<string> =>
  nextNumber(tx, `CERT-${when.getUTCFullYear()}-`);

export const generateVerificationCode = (): string =>
  randomBytes(8).toString("hex").toUpperCase();

export const generateOpaqueToken = (): string => randomBytes(32).toString("hex");

export const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export const generateShortCode = (prefix: string, length = 6): string =>
  `${prefix}-${randomBytes(length).toString("hex").slice(0, length).toUpperCase()}`;
