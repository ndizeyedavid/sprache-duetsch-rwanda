// Usage (from backend/): npx tsx prisma/course-import/translate/check-work.ts [work files…]   (default: all)
// Checks translated work files before merge.ts: every line and word form has English, gaps (___) are
// kept, nothing is left in German by mistake. Exits 1 and lists the problems when anything is off.
import { readdir,readFile } from "node:fs/promises";
import { workProblems,workFileSchema } from "./work-file.js";

const root = new URL("./work/", import.meta.url);
const args = process.argv.slice(2);
const files = args.length ? args : (await Promise.all((await readdir(root)).map(async (level) =>
  (await readdir(new URL(`${level}/`, root))).filter((name) => name.endsWith(".json")).map((name) => `${root.pathname}${level}/${name}`)))).flat();

let failed = 0;
for (const file of files) {
  const parsed = workFileSchema.safeParse(JSON.parse(await readFile(file, "utf8")));
  const problems = parsed.success ? workProblems(parsed.data) : parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  if (problems.length) { failed += 1; console.log(`${file}\n  ${problems.slice(0, 12).join("\n  ")}${problems.length > 12 ? `\n  … ${problems.length - 12} more` : ""}`); }
}
console.log(failed ? `${failed} of ${files.length} files need work` : `${files.length} files OK`);
process.exit(failed ? 1 : 0);
