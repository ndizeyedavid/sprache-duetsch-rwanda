import type { Request, Response } from "express";
import { unauthorized } from "../../lib/http-error.js";
import * as authService from "./auth.service.js";
import type { RequestMeta } from "./auth.service.js";
import type { LoginInput, RegisterInput, ResetPasswordInput, UpdateProfileInput } from "./auth.schema.js";

const requestMeta = (req: Request): RequestMeta => ({
  ipAddress: req.ip ?? null,
  userAgent: req.headers["user-agent"] ?? null,
});

const readRefreshToken = (req: Request): string | undefined => {
  const fromBody = (req.body as { refreshToken?: string } | undefined)?.refreshToken;
  if (typeof fromBody === "string" && fromBody.length > 0) {
    return fromBody;
  }
  const fromCookie = (req.cookies as Record<string, string> | undefined)?.refreshToken;
  return typeof fromCookie === "string" && fromCookie.length > 0 ? fromCookie : undefined;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.registerStudent(req.body as RegisterInput, requestMeta(req));
  res.status(201).json({ success: true, data: result });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body as LoginInput, requestMeta(req));
  res.json({ success: true, data: result });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const tokens = await authService.refreshSession(readRefreshToken(req), requestMeta(req));
  res.json({ success: true, data: { tokens } });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  await authService.logout(readRefreshToken(req));
  res.json({ success: true, data: { message: "Signed out" } });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized();
  }
  const user = await authService.getUserProfile(req.user.id);
  res.json({ success: true, data: { user } });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.forgotPassword(req.body as { email: string });
  res.json({
    success: true,
    data: { message: "If the email is registered, a reset link has been sent", ...result },
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  await authService.resetPassword(req.body as ResetPasswordInput);
  res.json({ success: true, data: { message: "Password has been reset" } });
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized();
  }
  await authService.changePassword(req.user.id, req.body as { currentPassword: string; newPassword: string });
  res.json({ success: true, data: { message: "Password has been changed" } });
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw unauthorized();
  const updated = await authService.updateMyProfile(req.user.id, req.body as UpdateProfileInput);
  res.json({ success: true, data: updated });
};
