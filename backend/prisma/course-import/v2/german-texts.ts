// Every German string the student view renders with tappable words (GermanText). The importer checks
// each of its words against the glossary. Plain labels (vocabulary headwords, tables, answer buttons,
// matching tiles) and grammar explanations (English beside them) are not tappable, so not checked.
import type { LessonPack, PracticeItem } from "./pack-schema.js";

function itemTexts(item: PracticeItem): string[] {
  switch (item.kind) {
    case "choose": return [item.prompt?.includes("___") ? item.prompt.replace("___", item.answer) : item.prompt ?? "",
      ...(item.optionsLang === "de" && !item.prompt?.includes("___") ? [item.answer] : [])];
    case "match": return [];
    case "translate": return item.from === "de" ? [item.text] : [item.answer];
    case "order": return [item.answer];
    case "fill": return [item.text.replace("___", item.answer)];
    case "listen": return [item.text];
    case "speak": return [item.text];
    case "truefalse": return [item.statement];
  }
}

export function lessonGermanTexts(pack: LessonPack): string[] {
  return [
    pack.summary,
    ...pack.goals.map((goal) => goal.de),
    ...pack.vocab.map((word) => word.example),
    ...pack.grammar.flatMap((topic) => topic.examples.map((example) => example.de)),
    ...pack.phrases.flatMap((group) => group.items.map((item) => item.de)),
    ...(pack.pronunciation?.examples.map((example) => example.de) ?? []),
    ...(pack.dialogue?.lines.map((line) => line.de) ?? []),
    ...(pack.reading?.paragraphs.flat().map((line) => line.de) ?? []),
    ...pack.sessions.flatMap((session) => session.items.flatMap(itemTexts)),
  ].filter((text) => text.trim() !== "");
}
