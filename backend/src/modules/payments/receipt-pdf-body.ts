import { amountInWords } from '../../lib/amount-in-words.js';
import type { Doc } from '../../lib/pdf-brand.js';
import { brandPalette as c, eyebrow, fittedText, longDate } from '../../lib/pdf-brand.js';
import type { ReceiptDocument } from './receipt-document.js';
import { currencyLabel } from './receipt-format.js';
import type { ReceiptLine } from './receipt-lines.js';
import { COL } from './receipt-pdf-header.js';

const { left: L, right: R, width: W, split: RX } = COL;
const HALF = R - RX;
const MAX_LINES = 3;

function detailRow(doc: Doc, label: string, value: string, y: number): void {
  fittedText(doc, label, { x: RX, y, width: 80, height: 13 }, { font: 'sans', size: 9, color: c.muted });
  fittedText(doc, value, { x: RX + 80, y, width: HALF - 80, height: 13 }, { font: 'sans-bold', size: 9, color: c.ink, align: 'right' });
}

/** Up to three fee lines; anything beyond is grouped so the page never overflows. */
function visibleLines(data: ReceiptDocument): ReceiptLine[] {
  const lines = data.lines.length ? data.lines : [{ title: data.description, detail: data.detail, amount: data.amount }];
  if (lines.length <= MAX_LINES) return lines;
  const rest = lines.slice(MAX_LINES - 1);
  return [...lines.slice(0, MAX_LINES - 1), { title: `${rest.length} more fees`, detail: rest.map(line => line.title).join(', '), amount: rest.reduce((t, l) => t + l.amount, 0) }];
}

/** Who paid, payment details, what it paid for, and the total. Returns the y where the next block starts. */
export function drawReceiptBody(doc: Doc, data: ReceiptDocument): number {
  eyebrow(doc, 'Received from', L, 210, HALF, c.red);
  fittedText(doc, data.payer.name, { x: L, y: 226, width: 230, height: 24 }, { font: 'serif', size: 17, color: c.navy });
  fittedText(doc, `Student number  ${data.payer.studentCode}`, { x: L, y: 254, width: 230, height: 13 }, { font: 'sans', size: 9, color: c.ink });
  fittedText(doc, data.payer.email, { x: L, y: 268, width: 230, height: 13 }, { font: 'sans', size: 9, color: c.muted });

  eyebrow(doc, 'Payment details', RX, 210, HALF, c.red);
  detailRow(doc, 'Date paid', longDate(data.paidAt), 228);
  detailRow(doc, 'Method', data.method, 244);
  detailRow(doc, 'Reference', data.reference ?? '—', 260);
  detailRow(doc, 'Issued on', longDate(data.issuedAt), 276);

  doc.roundedRect(L, 306, W, 24, 6).fill(c.white);
  eyebrow(doc, 'Paid for', L + 14, 314, 200, c.muted);
  eyebrow(doc, 'Amount', R - 214, 314, 200, c.muted, 'right');
  let y = 340;
  for (const line of visibleLines(data)) {
    fittedText(doc, line.title, { x: L + 14, y, width: 320, height: 14 }, { font: 'sans-bold', size: 10.5, color: c.navy });
    if (line.detail) fittedText(doc, line.detail, { x: L + 14, y: y + 14, width: 320, height: 12 }, { font: 'sans', size: 8.5, color: c.muted });
    fittedText(doc, currencyLabel(line.amount, data.currency), { x: R - 214, y, width: 200, height: 14 }, { font: 'sans-bold', size: 10.5, color: c.navy, align: 'right' });
    y += 32;
  }
  doc.moveTo(L, y).lineTo(R, y).lineWidth(0.7).strokeColor(c.sand).stroke();

  const top = y + 18;
  eyebrow(doc, 'Amount in words', L, top + 8, 230, c.muted);
  fittedText(doc, amountInWords(data.amount, data.currency), { x: L, y: top + 24, width: 230, height: 40 }, { font: 'serif', size: 11, color: c.ink });
  doc.roundedRect(RX, top, HALF, 72, 10).fill(c.navy);
  eyebrow(doc, data.voidedAt ? 'Amount (cancelled)' : 'Total received', RX + 18, top + 14, HALF - 36, c.onRed);
  fittedText(doc, currencyLabel(data.amount, data.currency), { x: RX + 18, y: top + 32, width: HALF - 36, height: 30 }, { font: 'sans-bold', size: 22, color: c.white });
  return top + 72 + 24;
}

/** Account position when the receipt was issued: fees, paid so far and what is left. */
export function drawReceiptSummary(doc: Doc, data: ReceiptDocument, y: number): void {
  const { fees, paid, balance } = data.summary;
  eyebrow(doc, 'Your account after this payment', L, y, W, c.muted);
  const cells: [string, string, string][] = [
    ['Total fees', currencyLabel(fees, data.currency), c.navy],
    ['Paid to date', currencyLabel(paid, data.currency), c.navy],
    balance > 0 ? ['Left to pay', currencyLabel(balance, data.currency), c.red]
      : ['Left to pay', balance < 0 ? `Credit ${currencyLabel(-balance, data.currency)}` : 'Fully paid', c.green],
  ];
  const width = (W - 16) / 3;
  cells.forEach(([label, value, color], index) => {
    const x = L + index * (width + 8);
    doc.roundedRect(x, y + 16, width, 54, 8).fillAndStroke(c.white, c.sand);
    fittedText(doc, label, { x: x + 14, y: y + 27, width: width - 28, height: 12 }, { font: 'sans', size: 8.5, color: c.muted });
    fittedText(doc, value, { x: x + 14, y: y + 42, width: width - 28, height: 20 }, { font: 'sans-bold', size: 13, color });
  });
  if (data.notes && y + 110 < 640) {
    eyebrow(doc, 'Note', L, y + 86, W, c.muted);
    fittedText(doc, data.notes, { x: L, y: y + 100, width: W, height: 26 }, { font: 'sans', size: 9, color: c.ink });
  }
}
