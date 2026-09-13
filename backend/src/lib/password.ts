import { compare, hash } from "bcryptjs";
import { env } from "../config/env.js";

export const hashPassword = (plain: string): Promise<string> => hash(plain, env.BCRYPT_ROUNDS);

export const verifyPassword = (plain: string, hashed: string): Promise<boolean> =>
  compare(plain, hashed);
