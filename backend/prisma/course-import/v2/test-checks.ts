// Content checks for test packs (answers reachable, no duplicate choices, exam parts complete) — run by verify-v2.
import { sentenceTiles } from "./build-sessions.js";
import type { TestPack } from "./test-schema.js";

const lower = (value: string) => value.trim().toLocaleLowerCase("de");

export function testProblems(pack: TestPack): string[] {
  const problems: string[] = [];
  pack.sections.forEach((section) => {
    if (section.listen && section.skill !== "LISTENING") problems.push(`${section.title}: only LISTENING sections have a section recording`);
    const recordings = (section.listen ? 1 : 0) + section.questions.filter((question) => "listen" in question && question.listen).length;
    if (section.plays && !recordings) problems.push(`${section.title}: "plays" set but nothing to play`);
    section.questions.forEach((question, index) => {
      const at = `${section.title}[${index + 1}] ${question.type}`;
      if (question.type === "choose") {
        if (!question.options.includes(question.answer)) problems.push(`${at}: answer "${question.answer}" is not one of the options`);
        if (new Set(question.options.map(lower)).size !== question.options.length) problems.push(`${at}: duplicate options`);
        if (question.options.length > 4 && !section.letters) problems.push(`${at}: more than 4 options needs "letters" (a list shown in the passage)`);
      }
      if (question.type === "order" && sentenceTiles(question.answer).length < 3) problems.push(`${at}: order needs at least 3 words`);
      if (question.type === "match" && new Set(question.pairs.map(([left]) => lower(left))).size !== question.pairs.length) problems.push(`${at}: repeated left side`);
      const heard = section.listen || ("listen" in question && question.listen);
      if (section.skill === "LISTENING" && (question.type === "choose" || question.type === "truefalse") && !heard) problems.push(`${at}: listening question without listen text`);
    });
  });
  if (pack.sections.every((section) => section.skill !== "WRITING")) problems.push("no WRITING section");
  return problems;
}
