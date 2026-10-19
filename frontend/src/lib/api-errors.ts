import { AxiosError } from 'axios';

type ApiErrorBody = { message?: string; error?: { message?: string; code?: string; details?: unknown } };

export function isAxiosError(error: unknown): error is AxiosError<ApiErrorBody> {
  return error instanceof AxiosError;
}

/** Status for distinguishing rejected requests from uncertain transport failures. */
export function apiErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

/** Extract field-level errors from a 400/409 response shape. */
export function apiFieldErrors(error: unknown): Record<string, string> {
  if (!isAxiosError(error)) return {};
  const details = (error.response?.data as ApiErrorBody | undefined)?.error?.details as
    | { body?: { path: (string | number)[]; message: string }[] }
    | { target?: string[] }
    | undefined;
  const out: Record<string, string> = {};
  if (details && typeof details === "object" && "body" in details && Array.isArray((details as { body: unknown }).body)) {
    for (const issue of (details as { body: { path: (string | number)[]; message: string }[] }).body) {
      const key = issue.path.join(".");
      if (key) out[key] = issue.message;
    }
  }
  // Prisma P2002 duplicate — surface the unique field if available
  if (details && typeof details === "object" && "target" in details && Array.isArray((details as { target: unknown }).target)) {
    const target = (details as { target: string[] }).target.join(", ");
    if (target) out["_form"] = `Duplicate: ${target} already exists`;
  }
  return out;
}

/** Human-readable message from any API failure. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    const message = data?.error?.message ?? data?.message;
    if (typeof message === 'string' && message.length > 0) {
      // Append first field error if present for immediate clarity
      const fields = apiFieldErrors(error);
      const first = Object.entries(fields).find(([k]) => k !== "_form");
      if (first) return `${message}: ${first[0]} — ${first[1]}`;
      if (fields._form) return `${message}: ${fields._form}`;
      return message;
    }
    if (error.message === 'Network Error') {
      return 'Cannot reach the server. Check your connection and try again.';
    }
  }
  return fallback;
}
