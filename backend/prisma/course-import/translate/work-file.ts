// Shape of a translation work file (extract.ts writes it, translators fill `en`/`lemma`, merge.ts reads
// it) and the checks a finished file must pass.
import { z } from "zod";
import { SAME } from "./memory.js";

export const workFileSchema = z.object({
  level: z.string(),
  lesson: z.number().int(),
  title: z.string(),
  lines: z.array(z.object({ de: z.string().min(1), en: z.string() })),
  forms: z.array(z.object({ form: z.string().min(1), context: z.string(), en: z.string(), lemma: z.string() })),
});
export type WorkFile = z.infer<typeof workFileSchema>;

const gaps = (text: string) => (text.match(/_{3,}/g) ?? []).length;

export function workProblems(file: WorkFile): string[] {
  const problems: string[] = [];
  file.lines.forEach((line, index) => {
    const en = line.en.trim();
    if (!en) problems.push(`lines[${index}] has no English: "${line.de.slice(0, 60)}"`);
    else if (en !== SAME && en === line.de.trim() && /\p{L}{3,}/u.test(en)) problems.push(`lines[${index}] English equals the German (use "=" if it is already English)`);
    else if (en !== SAME && gaps(line.de) !== gaps(en)) problems.push(`lines[${index}] keeps ${gaps(en)} of ${gaps(line.de)} gaps (___)`);
  });
  file.forms.forEach((form, index) => {
    if (!form.en.trim()) problems.push(`forms[${index}] "${form.form}" has no English`);
  });
  return problems;
}
