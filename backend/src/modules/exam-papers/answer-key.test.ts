import { describe,expect,it } from "vitest";
import { answerSheet,formatAnswerKey,markSheet,parseAnswerKey } from "./answer-key.js";

const TEXT = `Lesen Teil 1 | a b c | b b c b a
Lesen Teil 4 | a b c d e f x | f c e x b
Hören Teil 4 | Ja Nein | ja Nein Ja Ja Nein`;

describe("exam paper answer keys", () => {
  it("parses one line per part and keeps the choices' spelling", () => {
    const key = parseAnswerKey(TEXT);
    expect(key?.parts).toHaveLength(3);
    expect(key?.parts[2]?.answers).toEqual(["Ja", "Nein", "Ja", "Ja", "Nein"]);
    expect(formatAnswerKey(key)).toBe(TEXT.replace("| ja Nein", "| Ja Nein"));
    expect(parseAnswerKey("  \n ")).toBeNull();
  });

  it("names the line with a bad answer or missing cells", () => {
    expect(() => parseAnswerKey("Lesen Teil 1 | a b c | b d")).toThrow(/line 1: "d"/);
    expect(() => parseAnswerKey("Lesen Teil 1 | a b c")).toThrow(/line 1/);
  });

  it("numbers items per section across parts, like the official answer sheet", () => {
    const sheet = answerSheet(parseAnswerKey(TEXT)!);
    expect(sheet.map((part) => [part.first, part.count])).toEqual([[1, 5], [6, 5], [1, 5]]);
    expect(sheet[0]).not.toHaveProperty("answers");
  });

  it("marks a sheet per part and per section, ignoring case and empty items", () => {
    const result = markSheet(parseAnswerKey(TEXT)!, [["b", "b", "a", null, "a"], ["F", "c", "e", "x", "a"], ["ja", "nein"]]);
    expect(result.parts.map((part) => part.score)).toEqual([3, 4, 2]);
    expect(result.sections).toEqual([{ name: "Lesen", score: 7, total: 10 }, { name: "Hören", score: 2, total: 5 }]);
    expect(result).toMatchObject({ score: 9, total: 15, percentage: 60 });
    expect(result.parts[0]?.items[2]).toEqual({ number: 3, given: "a", answer: "c", correct: false });
  });
});
