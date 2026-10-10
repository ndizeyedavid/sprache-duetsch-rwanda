import path from 'node:path';
import type PDFDocument from 'pdfkit';

/** Shared look for every school PDF (certificates, receipts): red on warm white, navy text. */
export const brandPalette = {
  paper: '#FBF8F5', white: '#FFFFFF', red: '#B60E1C', redDeep: '#8A0A14', redSoft: '#F7E4E5',
  navy: '#203044', ink: '#2A3340', muted: '#6B7079', peach: '#EEA76D', sand: '#E7DBD4', onRed: '#F8D9C6',
  green: '#1F7A4D', greenSoft: '#E3F2EA',
} as const;

export type Doc = PDFKit.PDFDocument;
export interface Box { x: number; y: number; width: number; height: number }
export interface TextStyle { font: 'sans' | 'sans-bold' | 'serif'; size: number; color: string; align?: 'left' | 'center' | 'right'; spacing?: number }

/** Registers the bundled fonts under the names the helpers use. */
export function registerBrandFonts(doc: InstanceType<typeof PDFDocument>): void {
  const fonts = path.resolve('assets/fonts');
  doc.registerFont('sans', path.join(fonts, 'Lato-Regular.ttf'));
  doc.registerFont('sans-bold', path.join(fonts, 'Lato-Bold.ttf'));
  doc.registerFont('serif', path.join(fonts, 'DejaVuSerif.ttf'));
}

/** Collects a pdfkit stream into one buffer. Call before drawing, then doc.end(). */
export function collectPdf(doc: Doc): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

/** Writes text inside a box, shrinking the font until it fits so long values never overflow. */
export function fittedText(doc: Doc, text: string, box: Box, style: TextStyle): void {
  let { size } = style;
  const options = { width: box.width, lineGap: 2, characterSpacing: style.spacing ?? 0 };
  doc.font(style.font).fontSize(size).fillColor(style.color);
  while (size > 6 && doc.heightOfString(text, options) > box.height) doc.fontSize(--size);
  doc.text(text, box.x, box.y, { ...options, height: box.height, align: style.align ?? 'left' });
}

/** Small letter-spaced caption used above every section. */
export function eyebrow(doc: Doc, text: string, x: number, y: number, width: number, color: string, align: 'left' | 'center' | 'right' = 'left'): void {
  fittedText(doc, text.toUpperCase(), { x, y, width, height: 12 }, { font: 'sans-bold', size: 7.5, color, spacing: 2, align });
}

export const longDate = (date: string | Date): string => new Date(date).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
