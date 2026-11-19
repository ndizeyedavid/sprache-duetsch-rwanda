import { describe,expect,it } from "vitest";
import { activityTexts,lessonBlocks,wordForms } from "./segments.js";

describe("translation segments", () => {
  it("splits a lesson into its innermost blocks with collapsed whitespace", () => {
    const html = `<h2>Grammatik: Der Artikel</h2><p>Jedes Nomen   hat <strong>einen</strong>
      Artikel.</p><table><tr><th>Genus</th><td>maskulin</td></tr></table><ul><li>der Tisch<ul><li>die Lampe</li></ul></li></ul><p>12</p><p>https://example.com</p>`;
    expect(lessonBlocks(html)).toEqual(["Grammatik: Der Artikel", "Jedes Nomen hat einen Artikel.", "Genus", "maskulin", "die Lampe"]);
    expect(lessonBlocks(null)).toEqual([]);
  });

  it("keeps what students see before answering apart from explanations and model answers", () => {
    const texts = activityTexts({
      instructions: "Ergänzen Sie die Lücke.",
      config: {
        items: [{ id: "a", prompt: "Ich ___ müde.", answer: "bin", options: ["bin", "ist"], explanation: "ich → bin" }],
        cards: [{ front: "der Tisch", back: "table", example: "Der Tisch ist neu." }],
        modelAnswer: "Ich heiße Aline.", explanation: "Erste Person.",
      },
    });
    expect(texts.visible).toEqual(["Ergänzen Sie die Lücke.", "Ich ___ müde.", "Der Tisch ist neu."]);
    expect(texts.hidden).toEqual(["ich → bin", "Ich heiße Aline.", "Erste Person."]);
  });

  it("lists each word form once with the first text it appears in", () => {
    expect([...wordForms(["Das ist gut.", "Das Haus ist alt."])]).toEqual([["Das", "Das ist gut."], ["ist", "Das ist gut."], ["gut", "Das ist gut."], ["Haus", "Das Haus ist alt."], ["alt", "Das Haus ist alt."]]);
  });
});
