import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/** Write a private JSON snapshot to the gitignored backend/backups/ folder. */
export async function writeBackup(name: string, payload: unknown): Promise<string> {
  const dir = fileURLToPath(new URL("../../backups/", import.meta.url));
  await mkdir(dir, { recursive: true });
  const file = `${dir}${name}-${new Date().toISOString().replaceAll(":", "-")}.json`;
  await writeFile(file, JSON.stringify(payload, null, 2), { mode: 0o600 });
  return file;
}
