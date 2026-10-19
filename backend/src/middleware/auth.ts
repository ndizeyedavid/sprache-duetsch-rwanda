import { asyncHandler } from "../lib/async-handler.js";
import { AppError,forbidden,unauthorized } from "../lib/http-error.js";
import { verifyAccessToken } from "../lib/jwt.js";
import { coursePriceFields,hasFinancialFields,withoutFinancialFields } from "../lib/financial-visibility.js";
import { prisma } from "../lib/prisma.js";
import { assertActiveSession } from "../modules/auth/single-device-policy.js";

const extractBearerToken = (header: string | undefined): string | undefined => {
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : undefined;
};

// Verifies the access token and re-loads the user so revoked/deactivated accounts
// stop working immediately instead of waiting for the token to expire.
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    throw unauthorized("Missing bearer token");
  }

  const payload = verifyAccessToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, status: true, activeSessionId: true },
  });

  if (!user) {
    throw unauthorized("Account no longer exists");
  }

  if (user.status === "WITHDRAWN" || (user.status === "SUSPENDED" && user.role !== "STUDENT")) {
    throw unauthorized("Account is not active");
  }
  // A suspended student keeps a session only to read the reason (GET /auth/me) and sign out.
  if (user.status === "SUSPENDED" && !(req.baseUrl === "/api/auth" && req.method === "GET" && req.path === "/me")) {
    throw new AppError(403, "Your account is suspended", { code: "ACCOUNT_SUSPENDED" });
  }

  // Students: only the most recent sign-in's tokens are accepted (one device at a time).
  assertActiveSession(user, payload.sid);

  req.user = { id: user.id, email: user.email, role: user.role };
  if (user.role === "ACADEMIC_ADMIN") {
    const allowed = req.baseUrl === '/api/levels' ? coursePriceFields : new Set<string>();
    if (hasFinancialFields(req.body, allowed)) throw forbidden("Financial changes require finance access");
    const sendJson = res.json.bind(res);
    res.json = (body: unknown) => sendJson(withoutFinancialFields(body, allowed));
  }
  next();
});
