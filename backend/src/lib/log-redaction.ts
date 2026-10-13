// Credentials that must never reach log output (pino-http logs request/response headers).
export const REDACTED_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers[\"x-relay-secret\"]",
  "req.headers[\"x-paypack-signature\"]",
  "req.headers[\"x-webhook-signature\"]",
  "res.headers[\"set-cookie\"]",
  "*.password",
  "*.newPassword",
  "*.currentPassword",
  "*.refreshToken",
  "*.accessToken",
  "*.token",
];
