import { createHash } from "node:crypto";

/** Deterministic UUID-shaped id so re-running an import updates the same rows. */
export function stableId(namespace: string, key: string): string {
  const h = createHash("sha256").update(`${namespace}:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
