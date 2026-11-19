// Spreadsheet exports built in the browser from what a page already shows (filters applied).

const PHONE = /^\+[\d\s()-]+$/;

/** One CSV cell: quoted when it holds a comma, quote or line break; formulas are neutralised (phone numbers stay as typed). */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@]/.test(text) && !PHONE.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

/** Save text as a CSV file; the BOM makes Excel read names with accents correctly. */
export function downloadCsv(text: string, filename: string): void {
  const url = URL.createObjectURL(new Blob(['﻿', text], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
