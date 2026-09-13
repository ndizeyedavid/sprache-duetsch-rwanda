import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";
import { PrismaClient } from "../generated/prisma/client.js";

// Prisma 7 is Rust-free and always talks to Postgres through a driver adapter.
// The `?schema=` param in DATABASE_URL is NOT read by the pg driver itself —
// the adapter needs it explicitly via the `schema` option.
const dbUrlForSchema = (() => {
  try {
    return new URL(env.DATABASE_URL).searchParams.get("schema") ?? undefined;
  } catch {
    return undefined;
  }
})();

const adapter = new PrismaPg(
  { connectionString: env.DATABASE_URL },
  dbUrlForSchema ? { schema: dbUrlForSchema } : undefined,
);

// Cache on globalThis so `tsx watch` reloads do not exhaust the connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type { Prisma } from "../generated/prisma/client.js";
