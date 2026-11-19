import "dotenv/config";
import { z } from "zod";

// Every runtime setting is validated once. Code never reads process.env directly.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // XendlyPay mobile money (MTN MoMo + Airtel Money). One API key per XendlyPay app; never sent to browsers.
  XENDLYPAY_ENABLED: z.enum(["true", "false"]).default("false"),
  XENDLYPAY_API_KEY: z.string().optional(),
  // Signing secret of the app's webhook. Until it is set, callbacks are refused and payments settle by polling.
  XENDLYPAY_WEBHOOK_SECRET: z.string().optional(),
  // The XendlyPay app mode this deployment expects. Payments made in any other mode are never credited.
  XENDLYPAY_MODE: z.enum(["test", "live"]).default("live"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_SECRET: z.string().min(16).optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(500),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  // Attendance below this percentage triggers a low-attendance alert.
  ATTENDANCE_ALERT_THRESHOLD: z.coerce.number().min(0).max(100).default(75),
  // How unpaid/overdue students are treated: FULL | LIMITED | NONE.
  UNPAID_ACCESS: z.enum(["FULL", "LIMITED", "NONE"]).default("LIMITED"),
  SEED_SUPERADMIN_EMAIL: z.string().min(3).default("admin@sparch.rw"),
  SEED_SUPERADMIN_PASSWORD: z.string().min(8).default("Admin123!"),
  // Public frontend base URL — embedded in certificate QR codes.
  PUBLIC_APP_URL: z.string().min(1).default("http://localhost:5173"),
  // Reminder scheduler; email delivery continues when reminders are disabled.
  REMINDERS_ENABLED: z.enum(["true", "false"]).default("true"),
  PAYMENT_REMINDER_LEAD_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  REMINDER_TIMEZONE: z.string().min(1).default("Africa/Kigali"),
  // Google sign-in is switched off; the endpoint answers 404 unless this is "true".
  GOOGLE_AUTH_ENABLED: z.enum(["true", "false"]).default("false"),
  // Google OAuth — Client ID used to verify Google ID tokens (audience check).
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  // SMTP — Hubmail (mail.hubmail.space:587, STARTTLS) for transactional and notification emails.
  // SMTP_SECURE="false" on 587 means STARTTLS is required (see lib/mailer.ts).
  SMTP_HOST: z.string().default("mail.hubmail.space"),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.enum(["true", "false"]).default("false"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  // Comma-separated origins allowed to call public enrollment endpoint without auth
  ENROLLMENT_ALLOWED_ORIGINS: z.string().optional(),
});

const parsed = envSchema.superRefine((value, ctx) => {
  if (value.XENDLYPAY_ENABLED === "true" && !/^xpay_[A-Za-z0-9]+_[A-Za-z0-9]+$/.test(value.XENDLYPAY_API_KEY?.trim() ?? "")) {
    ctx.addIssue({ code: "custom", path: ["XENDLYPAY_API_KEY"], message: "A XendlyPay key (xpay_…) is required when XendlyPay is enabled" });
  }
}).safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";

export const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const enrollmentAllowedOrigins = (env.ENROLLMENT_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Hard-known school website origins (always allowed, even if CORS_ORIGINS is not updated).
// deutschspracherw.org is the current domain; deutshsprache.org (no "c") is the retired one and still serves the site.
export const defaultEnrollmentOrigins = [
  "https://deutschspracherw.org",
  "https://www.deutschspracherw.org",
  "https://deutshsprache.org",
  "https://www.deutshsprache.org",
];

export const smtpEnabled = Boolean(env.SMTP_USER && env.SMTP_PASS);
export const smtpFrom = env.SMTP_FROM ?? env.SMTP_USER ?? "noreply@sparch.rw";

// Refresh tokens get their own secret when configured, otherwise share the access secret.
export const refreshTokenSecret = env.JWT_REFRESH_SECRET ?? env.JWT_SECRET;
