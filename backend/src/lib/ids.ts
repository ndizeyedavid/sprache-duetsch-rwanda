import { createHash, randomBytes } from "node:crypto";
import type { Prisma } from "../generated/prisma/client.js";

// Any Prisma client or interactive-transaction client can run these generators.
type PrismaExecutor = Prisma.TransactionClient;

const pad = (value: number, size = 4): string => String(value).padStart(size, "0");

export const dateStamp = (date: Date = new Date()): string =>
  `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}`;

// Human-facing identifiers. Counting the same prefix keeps them short and readable;
// the unique constraint on each column is the real guard against duplicates.
export const generateStudentCode = async (tx: PrismaExecutor, when = new Date()): Promise<string> => {
  const prefix = `SDR-${when.getFullYear()}-`;
  const count = await tx.student.count({ where: { studentCode: { startsWith: prefix } } });
  return `${prefix}${pad(count + 1)}`;
};

export const generateReceiptNumber = async (
  tx: PrismaExecutor,
  when = new Date(),
): Promise<string> => {
  const prefix = `RCP-${dateStamp(when)}-`;
  const count = await tx.receipt.count({ where: { receiptNumber: { startsWith: prefix } } });
  return `${prefix}${pad(count + 1)}`;
};

export const generateCertificateNumber = async (
  tx: PrismaExecutor,
  when = new Date(),
): Promise<string> => {
  const prefix = `CERT-${when.getFullYear()}-`;
  const count = await tx.certificate.count({ where: { certificateNumber: { startsWith: prefix } } });
  return `${prefix}${pad(count + 1)}`;
};

export const generateVerificationCode = (): string =>
  randomBytes(8).toString("hex").toUpperCase();

export const generateOpaqueToken = (): string => randomBytes(32).toString("hex");

export const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export const generateShortCode = (prefix: string, length = 6): string =>
  `${prefix}-${randomBytes(length).toString("hex").slice(0, length).toUpperCase()}`;
