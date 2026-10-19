import { randomUUID } from "node:crypto";
import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { env,refreshTokenSecret } from "../config/env.js";
import type { Role } from "../generated/prisma/client.js";
import { unauthorized } from "./http-error.js";

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  typ: "access" | "refresh";
  /** Sign-in session id; students are allowed one active session at a time. */
  sid?: string;
}

const accessOptions: SignOptions = {
  expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
};

const refreshOptions: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
};

const buildPayload = (
  userId: string,
  email: string,
  role: Role,
  typ: TokenPayload["typ"],
  sessionId?: string,
): TokenPayload => ({ sub: userId, email, role, typ, ...(sessionId ? { sid: sessionId } : {}) });

export const signAccessToken = (userId: string, email: string, role: Role, sessionId?: string): string =>
  jwt.sign(buildPayload(userId, email, role, "access", sessionId), env.JWT_SECRET, accessOptions);

// `jwtid` keeps two refresh tokens issued in the same second from colliding on their stored hash.
export const signRefreshToken = (userId: string, email: string, role: Role, sessionId?: string): string =>
  jwt.sign(buildPayload(userId, email, role, "refresh", sessionId), refreshTokenSecret, { ...refreshOptions, jwtid: randomUUID() });

const verifyWith = (token: string, secret: string, expected: TokenPayload["typ"]): TokenPayload => {
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    if (decoded.typ !== expected) {
      throw unauthorized("Invalid token type");
    }
    return decoded;
  } catch {
    throw unauthorized("Invalid or expired token");
  }
};

const DURATION_UNITS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

// Turns the configured refresh lifetime (e.g. "30d") into an absolute expiry date so
// the stored token row and the signed JWT expire together.
export const refreshTokenExpiry = (): Date => {
  const match = /^(\d+)\s*([smhd])?$/.exec(env.JWT_REFRESH_EXPIRES_IN.trim());
  if (!match) {
    return new Date(Date.now() + 30 * DURATION_UNITS.d);
  }
  const value = Number(match[1]);
  const unit = match[2] ?? "s";
  return new Date(Date.now() + value * (DURATION_UNITS[unit] ?? 1000));
};

export const verifyAccessToken = (token: string): TokenPayload =>
  verifyWith(token, env.JWT_SECRET, "access");

export const verifyRefreshToken = (token: string): TokenPayload =>
  verifyWith(token, refreshTokenSecret, "refresh");
