import { asyncHandler } from "../lib/async-handler.js";
import { unauthorized } from "../lib/http-error.js";
import { verifyAccessToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";

const extractBearerToken = (header: string | undefined): string | undefined => {
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : undefined;
};

// Verifies the access token and re-loads the user so revoked/deactivated accounts
// stop working immediately instead of waiting for the token to expire.
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    throw unauthorized("Missing bearer token");
  }

  const payload = verifyAccessToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, status: true },
  });

  if (!user) {
    throw unauthorized("Account no longer exists");
  }

  if (user.status === "SUSPENDED" || user.status === "WITHDRAWN") {
    throw unauthorized("Account is not active");
  }

  req.user = { id: user.id, email: user.email, role: user.role };
  next();
});
