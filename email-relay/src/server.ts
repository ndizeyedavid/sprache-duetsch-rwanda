import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import nodemailer from "nodemailer";
import { z } from "zod";

const env = z
  .object({
    PORT: z.coerce.number().default(3001),
    RELAY_SECRET: z.string().min(8, "RELAY_SECRET required — same value as backend EMAIL_RELAY_SECRET"),
    CORS_ORIGINS: z.string().default(""),
    SMTP_HOST: z.string().default("smtp.gmail.com"),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_SECURE: z.enum(["true", "false"]).default("false"),
    SMTP_USER: z.string().min(1, "SMTP_USER required"),
    SMTP_PASS: z.string().min(1, "SMTP_PASS required"),
    SMTP_FROM: z.string().optional(),
  })
  .parse(process.env);

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

const allowed = env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
  }),
);

// Health for nginx / uptime checks
app.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE === "true",
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  tls: { minVersion: "TLSv1.2", servername: env.SMTP_HOST },
});

transporter.verify().then(
  () => console.log(`[relay] SMTP verified as ${env.SMTP_USER} via ${env.SMTP_HOST}:${env.SMTP_PORT}`),
  (err) => console.error("[relay] SMTP verify failed:", err),
);

const from = env.SMTP_FROM && env.SMTP_FROM.includes("<") ? env.SMTP_FROM : `Deutsch Sprache RW <${env.SMTP_FROM ?? env.SMTP_USER}>`;

const sendSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(1_000_000),
  text: z.string().max(200_000).optional(),
  replyTo: z.string().email().optional(),
});

app.post(
  "/send",
  rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false }),
  async (req, res) => {
    const secret = req.header("x-relay-secret");
    if (!env.RELAY_SECRET || secret !== env.RELAY_SECRET) {
      res.status(401).json({ success: false, error: "Unauthorized — bad relay secret" });
      return;
    }
    const parsed = sendSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.flatten() });
      return;
    }
    const { to, subject, html, text, replyTo } = parsed.data;
    try {
      const info = await transporter.sendMail({ from, to, subject, html, text, replyTo });
      console.log(`[relay] sent to ${to} — ${info.messageId}`);
      res.json({ success: true, messageId: info.messageId });
    } catch (err) {
      console.error("[relay] sendMail failed:", err);
      res.status(502).json({ success: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
);

app.listen(env.PORT, () => {
  console.log(`[relay] listening on :${env.PORT} — POST /send (auth x-relay-secret)`);
});
