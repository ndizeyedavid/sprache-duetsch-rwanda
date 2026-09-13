import type { AuthUser } from "./auth.js";

// Request augmentation used by the auth and validation middleware.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
