import { createHmac } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { notFound } from "./http-error.js";

// Invoice links are emailed and open without signing in, so they use their own derived key:
// an invoice token can never be replayed as an access token, and vice versa.
const INVOICE_LINK_TTL = "45d";
const invoiceKey = () => createHmac("sha256", env.JWT_SECRET).update("invoice-link:v1").digest("hex");

export const signInvoiceToken = (studentId: string): string =>
  jwt.sign({ sub: studentId, typ: "invoice" }, invoiceKey(), { expiresIn: INVOICE_LINK_TTL });

/** Returns the student id the link was issued for. Bad or expired links look like a missing invoice. */
export const verifyInvoiceToken = (token: string): string => {
  try {
    const decoded = jwt.verify(token, invoiceKey()) as { sub?: string; typ?: string };
    if (decoded.typ === "invoice" && decoded.sub) return decoded.sub;
  } catch { /* fall through */ }
  throw notFound("This invoice link is invalid or has expired. Ask the finance office for a new one.");
};

export const invoiceUrl = (studentId: string): string =>
  `${env.PUBLIC_APP_URL.replace(/\/$/, "")}/invoice/${signInvoiceToken(studentId)}`;
