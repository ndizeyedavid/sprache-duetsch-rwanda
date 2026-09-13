import type { Role } from "../generated/prisma/client.js";

// The authenticated principal attached to every protected request.
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
