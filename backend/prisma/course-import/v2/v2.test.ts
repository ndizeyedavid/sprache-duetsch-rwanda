import { describe,expect,it } from "vitest";
import { AudioCollector,spokenHeadword,spokenText } from "./audio.js";
import { buildSession,sentenceTiles } from "./build-sessions.js";
import { packProblems } from "./checks.js";
import type { LessonPack } from "./pack-schema.js";
import { lessonPack } from "./pack-schema.js";

const pack = (sessions: unknown[]): LessonPack => lessonPack.parse({
  level: "A1", lesson: 1, title: "T", titleEn: "T", summary: "S", summaryEn: "S", goals: [{ de: "a", en: "a" }],
  vocab: Array.from({ length: 4 }, (_, index) => ({ de: `Wort${index}`, en: "word", example: "Das ist gut.", exampleEn: "That is good." })),
  grammar: [], phrases: [], sessions,
});

describe("spoken text", () => {
  it("drops slashes, ellipses, arrows and hints", () => {
    expect(spokenText("Danke schön! — Bitte schön!")).toBe("Danke schön! Bitte schön!");
    expect(spokenText("Hallo! / Guten Tag!")).toBe("Hallo! Guten Tag!");
    expect(spokenText("___ heißt du? (Fragewort)")).toBe("heißt du?");
    expect(spokenText("Kommst du aus Kigali? ↗")).toBe("Kommst du aus Kigali?");
  });

  it("speaks the dictionary form of a headword", () => {
    expect(spokenHeadword("der Name, -n")).toBe("der Name");
    expect(spokenHeadword("das Land, ¨-er")).toBe("das Land");
    expect(spokenHeadword("auf|stehen")).toBe("aufstehen");
  });
});

describe("sessions", () => {
  it("split answers into word tiles without punctuation", () => {
    expect(sentenceTiles("I'm from Rwanda.")).toEqual(["I'm", "from", "Rwanda"]);
  });

  it("give every item a stable id and audio", () => {
    const session = { key: "translate", title: "Ü", titleEn: "T", items: Array.from({ length: 4 }, (_, index) => ({ kind: "translate", from: "de", text: `Ich bin ${index}.`, answer: `I am ${index}.` })) };
    const built = buildSession(pack([session]).sessions[0], new AudioCollector());
    const again = buildSession(pack([session]).sessions[0], new AudioCollector());
    expect(built.items.map((item) => item.id)).toEqual(again.items.map((item) => item.id));
    expect(new Set(built.items.map((item) => item.id)).size).toBe(4);
    expect(built.items.every((item) => "audio" in item && item.audio?.startsWith("/audio/"))).toBe(true);
  });
});

describe("packProblems", () => {
  it("finds unreachable answers and missing passages", () => {
    const problems = packProblems(pack([{ key: "read", title: "L", titleEn: "R", items: [
      { kind: "choose", promptEn: "?", options: ["a", "b"], answer: "c" },
      { kind: "truefalse", statement: "Er ist hier.", statementEn: "He is here.", answer: true },
      { kind: "fill", text: "Ich ___ hier.", answer: "bin", options: ["ist", "bist"], en: "I am here." },
      { kind: "listen", mode: "choose", text: "Hallo!", options: ["Tschüss!", "Danke!"], en: "Hi!" },
    ] }]));
    expect(problems.join("\n")).toMatch(/not one of the options/);
    expect(problems.join("\n")).toMatch(/need a passage/);
    expect(problems.join("\n")).toMatch(/missing from options/);
    expect(problems.join("\n")).toMatch(/must include the spoken text/);
  });
});
