import type { Response } from "express";
import { Parser } from "json2csv";

// Shared CSV export helper (management reports, receipts, attendance, grades).
// Rows are flattened to plain objects by each service; keys become headers.
export const toCsv = (rows: Record<string, unknown>[]): string => {
  if (rows.length === 0) {
    return "";
  }
  return new Parser({ fields: Object.keys(rows[0] ?? {}) }).parse(rows);
};

export const sendCsv = (res: Response, filename: string, rows: Record<string, unknown>[]): void => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  // BOM so Excel opens UTF-8 (Kinyarwanda/German characters) correctly.
  res.send(`\uFEFF${toCsv(rows)}`);
};

export const iso = (value: Date | string | null | undefined): string => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};
