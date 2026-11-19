import { describe,expect,it } from "vitest";
import { AudioCollector } from "./audio.js";
import { buildTest } from "./build-test.js";
import { parseScript,scriptProblems } from "./script.js";
import { testPack } from "./test-schema.js";

describe("listening scripts", () => {
  it("reads M:/F: turns and continues unlabelled lines", () => {
    expect(parseScript("F: Hallo!\nM: Guten Tag.\nWie geht's?")).toEqual([{ speaker: "f", text: "Hallo!" }, { speaker: "m", text: "Guten Tag. Wie geht's?" }]);
    expect(parseScript("Achtung: Der Zug fährt heute von Gleis 3.")).toEqual([{ speaker: "m", text: "Achtung: Der Zug fährt heute von Gleis 3." }]);
  });

  it("rejects other speaker labels and half-labelled conversations", () => {
    expect(scriptProblems("Frau: Hallo\nMann: Hi")).not.toEqual([]);
    expect(scriptProblems("Hallo\nM: Hi")).not.toEqual([]);
    expect(scriptProblems("M: Hallo\nF: Hi")).toEqual([]);
  });

  it("renders a conversation as one clip and a monologue like lesson audio", () => {
    const audio = new AudioCollector();
    const dialogue = audio.script("F: Hallo!\nM: Guten Tag.");
    expect(dialogue).toMatch(/^\/audio\/dialogue\/[0-9a-f]{16}\.mp3$/);
    expect(audio.script("Guten Tag.")).toBe(audio.say("Guten Tag."));
    expect(audio.list().find((clip) => clip.url === dialogue)).toMatchObject({ parts: [{ voice: "kerstin-low", text: "Hallo!" }, { voice: "thorsten-high", text: "Guten Tag." }] });
  });
});

describe("test sections", () => {
  it("keeps instructions, reading text and the shared recording on the section", () => {
    const pack = testPack.parse({
      level: "A1", kind: "final", title: "T", titleEn: "T", description: "D", descriptionEn: "D", durationMinutes: 60, after: 24, sections: [
        { skill: "LISTENING", title: "Hören, Teil 4", titleEn: "Listening, part 4", intro: "Sie hören ein Interview.", listen: "M: Was sind Sie von Beruf?\nF: Ich bin Ärztin.", plays: 2, letters: true,
          questions: [{ type: "choose", prompt: "Die Frau arbeitet als Ärztin.", options: ["Ja", "Nein"], answer: "Ja" }] },
        { skill: "WRITING", title: "Schreiben", titleEn: "Writing", intro: "Schreiben Sie.", questions: [{ type: "write", prompt: "Schreiben Sie eine SMS.", promptEn: "Write a text message.", points: 10, modelAnswer: "Hallo Tom!" }] },
      ],
    });
    const { questions, sections } = buildTest(pack, new AudioCollector());
    expect(questions[0]).toMatchObject({ prompt: "Die Frau arbeitet als Ärztin.", audioUrl: null, options: ["Ja", "Nein"], correctAnswer: "Ja" });
    expect(sections[0]).toMatchObject({ title: "Hören, Teil 4 · Listening, part 4", plays: 2, letters: true, questionKeys: [questions[0]?.key] });
    expect(sections[0]?.audioUrl).toMatch(/^\/audio\/dialogue\//);
    expect(sections[1]).toMatchObject({ audioUrl: null, plays: null, letters: false });
  });
});
