import "dotenv/config";
import { z } from "zod";

// Every runtime setting is validated once. Code never reads process.env directly.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
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
  // Reminder scheduler (node-cron). DISABLED skips all jobs (tests, one-off scripts).
  REMINDERS_ENABLED: z.enum(["true", "false"]).default("true"),
  REMINDER_TIMEZONE: z.string().min(1).default("Africa/Kigali"),
  // Google OAuth — Client ID for verifying ID tokens from @react-oauth/google.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

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

// Refresh tokens get their own secret when configured, otherwise share the access secret.
export const refreshTokenSecret = env.JWT_REFRESH_SECRET ?? env.JWT_SECRET;
