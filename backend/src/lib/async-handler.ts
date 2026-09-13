import type { NextFunction, Request, RequestHandler, Response } from "express";

// Express 5 forwards rejected promises from async handlers automatically, but wrapping
// keeps behaviour explicit and works the same for any handler we mix in.
export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
