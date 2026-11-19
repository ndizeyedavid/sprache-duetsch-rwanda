// Content checks a pack must pass before import: answer keys that can actually be reached,
// passages that exist, and no duplicate or empty choices. Returns human-readable problems.
import { sentenceTiles } from "./build-sessions.js";
import type { LessonPack, PracticeItem } from "./pack-schema.js";

const lower = (value: string) => value.trim().toLocaleLowerCase("de");
const duplicates = (values: string[]) => values.filter((value, index) => values.map(lower).indexOf(lower(value)) !== index);

function itemProblems(item: PracticeItem): string[] {
  const problems: string[] = [];
  switch (item.kind) {
    case "choose":
      if (!item.options.some((option) => option === item.answer)) problems.push(`answer "${item.answer}" is not one of the options`);
      if (duplicates(item.options).length) problems.push(`duplicate options ${duplicates(item.options).join(", ")}`);
      if (item.prompt?.includes("___") && item.optionsLang === "en") problems.push("gap prompt with English options");
      break;
    case "match": {
      const left = item.pairs.map(([de]) => de), right = item.pairs.map(([, en]) => en);
      if (duplicates(left).length || duplicates(right).length) problems.push("match pairs repeat a word");
      break;
    }
    case "translate":
      if (sentenceTiles(item.answer).length < 2 && item.from === "de") problems.push("translate answer has fewer than 2 words (use choose/match)");
      if ((item.accepted ?? []).some((alt) => lower(alt) === lower(item.answer))) problems.push("accepted repeats the answer");
      if ((item.distractors ?? []).some((word) => sentenceTiles(item.answer).map(lower).includes(lower(word)))) problems.push("a distractor is part of the answer");
      break;
    case "order":
      if (sentenceTiles(item.answer).length < 3) problems.push("order needs at least 3 words");
      break;
    case "fill":
      if (item.options && !item.options.includes(item.answer)) problems.push(`fill answer "${item.answer}" missing from options`);
      break;
    case "listen":
      if (item.mode === "choose" && !item.options?.includes(item.text)) problems.push("listen/choose options must include the spoken text");
      if (item.mode === "type" && item.options) problems.push("listen/type takes no options");
      break;
    case "speak":
    case "truefalse":
      break;
  }
  return problems;
}

export function packProblems(pack: LessonPack): string[] {
  const problems: string[] = [];
  const at = (where: string, list: string[]) => list.forEach((problem) => problems.push(`${where}: ${problem}`));
  const keys = pack.sessions.map((session) => session.key);
  if (duplicates(keys).length) problems.push(`sessions repeat ${duplicates(keys).join(", ")}`);
  for (const session of pack.sessions) {
    if (session.passage === "reading" && !pack.reading) problems.push(`${session.key}: passage "reading" but the lesson has no reading text`);
    if (session.passage === "dialogue" && !pack.dialogue) problems.push(`${session.key}: passage "dialogue" but the lesson has no dialogue`);
    if (session.items.some((item) => item.kind === "truefalse") && !session.passage) problems.push(`${session.key}: true/false questions need a passage`);
    session.items.forEach((item, index) => at(`${session.key}[${index + 1}] ${item.kind}`, itemProblems(item)));
  }
  if (pack.dialogue) {
    const speakers = new Set(Object.keys(pack.dialogue.speakers));
    const unknown = [...new Set(pack.dialogue.lines.map((line) => line.speaker).filter((speaker) => !speakers.has(speaker)))];
    if (unknown.length) problems.push(`dialogue: no voice for ${unknown.join(", ")}`);
  }
  return problems;
}
