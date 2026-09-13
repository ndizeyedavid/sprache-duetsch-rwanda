import type { Request } from "express";

// Typed accessors for values populated by the `validate` middleware. Route handlers
// cast to their module's input types, keeping controllers free of `as` gymnastics.

export const validatedBody = <T>(req: Request): T => req.validated?.body as T;

export const validatedQuery = <T>(req: Request): T => req.validated?.query as T;

export const validatedParams = <T>(req: Request): T => req.validated?.params as T;

export const actorId = (req: Request): string | undefined => req.user?.id;
