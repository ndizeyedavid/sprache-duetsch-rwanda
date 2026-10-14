import { env } from "../config/env.js";
import { brandPalette as c } from "./pdf-brand.js";

/** Everything a transactional email can show. All strings are plain text and escaped here. */
export interface EmailContent {
  /** Inbox preview line shown next to the subject. */
  preheader: string;
  title: string;
  greeting?: string;
  paragraphs: string[];
  /** One-time code rendered as a large, spaced block. */
  code?: string;
  /** Label/value rows, e.g. amounts on a balance reminder. Emphasised rows render in brand red. */
  details?: { label: string; value: string; emphasis?: boolean }[];
  action?: { label: string; url: string };
  footnote?: string;
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

const appUrl = () => env.PUBLIC_APP_URL.replace(/\/$/, "");
const FONT = "'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

const paragraph = (text: string) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:${c.ink};">${escapeHtml(text).replace(/\n/g, "<br>")}</p>`;

const codeBlock = (code: string) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
    <tr><td align="center" style="background:${c.redSoft};border-radius:12px;padding:22px 12px;">
      <div style="font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:${c.redDeep};">${escapeHtml(code)}</div>
    </td></tr>
  </table>`;

const detailRows = (rows: NonNullable<EmailContent["details"]>) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 24px;border:1px solid ${c.sand};border-radius:12px;border-collapse:separate;">
    ${rows.map((row, i) => `<tr>
      <td style="padding:12px 16px;font-size:14px;color:${c.muted};${i ? `border-top:1px solid ${c.sand};` : ""}">${escapeHtml(row.label)}</td>
      <td align="right" style="padding:12px 16px;font-size:15px;font-weight:${row.emphasis ? 700 : 600};color:${row.emphasis ? c.red : c.navy};white-space:nowrap;${i ? `border-top:1px solid ${c.sand};` : ""}">${escapeHtml(row.value)}</td>
    </tr>`).join("")}
  </table>`;

const button = (action: NonNullable<EmailContent["action"]>) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
    <tr><td style="border-radius:999px;background:${c.red};">
      <a href="${escapeHtml(action.url)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:${c.white};text-decoration:none;border-radius:999px;">${escapeHtml(action.label)}</a>
    </td></tr>
  </table>
  <p style="margin:0 0 16px;font-size:12px;line-height:18px;color:${c.muted};">If the button does not work, copy this link into your browser:<br><a href="${escapeHtml(action.url)}" style="color:${c.red};word-break:break-all;">${escapeHtml(action.url)}</a></p>`;

/** Branded, table-based HTML (renders in Gmail, Outlook and mobile clients) plus a plain-text twin. */
export function renderEmail(content: EmailContent): { html: string; text: string } {
  const year = new Date().getUTCFullYear();
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(content.title)}</title></head>
<body style="margin:0;padding:0;background:${c.paper};font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(content.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.paper};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="background:${c.red};border-radius:16px 16px 0 0;padding:22px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;padding-right:12px;"><img src="${appUrl()}/logo.png" width="40" height="40" alt="" style="display:block;border-radius:8px;background:${c.white};"></td>
            <td style="vertical-align:middle;font-size:18px;font-weight:700;color:${c.white};letter-spacing:0.2px;">Deutsch Sprache RW</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:${c.white};padding:32px;border:1px solid ${c.sand};border-top:0;border-radius:0 0 16px 16px;">
          <h1 style="margin:0 0 20px;font-size:22px;line-height:30px;font-weight:700;color:${c.navy};">${escapeHtml(content.title)}</h1>
          ${content.greeting ? paragraph(content.greeting) : ""}
          ${content.paragraphs.map(paragraph).join("")}
          ${content.code ? codeBlock(content.code) : ""}
          ${content.details?.length ? detailRows(content.details) : ""}
          ${content.action ? button(content.action) : ""}
          ${content.footnote ? `<p style="margin:8px 0 0;padding-top:16px;border-top:1px solid ${c.sand};font-size:13px;line-height:20px;color:${c.muted};">${escapeHtml(content.footnote)}</p>` : ""}
        </td></tr>
        <tr><td align="center" style="padding:20px 24px;font-size:12px;line-height:18px;color:${c.muted};">
          Deutsch Sprache RW<br>
          <a href="${appUrl()}" style="color:${c.muted};">${escapeHtml(appUrl().replace(/^https?:\/\//, ""))}</a> · © ${year}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    content.title, "",
    ...(content.greeting ? [content.greeting, ""] : []),
    ...content.paragraphs.flatMap(p => [p, ""]),
    ...(content.code ? [`Your code: ${content.code}`, ""] : []),
    ...(content.details ?? []).map(row => `${row.label}: ${row.value}`),
    ...(content.details?.length ? [""] : []),
    ...(content.action ? [`${content.action.label}: ${content.action.url}`, ""] : []),
    ...(content.footnote ? [content.footnote, ""] : []),
    "— Deutsch Sprache RW",
  ].join("\n");
  return { html, text };
}
