import { describe, expect, it } from "vitest";
import { isDummyUrl, placeholderReason, testReason } from "./signals.js";

describe("A1 cleanup signals", () => {
  it("recognises test titles, QA markers and keyboard mashes", () => {
    for (const text of ["shdad", "sdadd", "hhsad", "test", "Test 2", "asdf", "QA studio review", "UI flow quiz",
      "Publish regression fixture", "A1 Big Practice Test — all question types", "wertyuhjvhkfgkjgljhkhlkh"]) {
      expect(testReason(text), text).not.toBeNull();
    }
    expect(testReason(null, "", "Motors", "wertyuhjvhkfgkjgljhkhlkh")).toContain("keyboard-mash");
  });

  it("leaves real German course content alone", () => {
    for (const text of ["Präpositionen", "Grundlagen", "Einstufungstest — A1", "Quick check", "Ü28.1", "Hallo! Introduce yourself",
      "Pflichtschulabschluss", "Rechtschreibung", "Das ist ein Test für dich?", "Glas", "Testergebnisse besprechen"]) {
      expect(testReason(text), text).toBeNull();
    }
  });

  it("recognises old seed placeholders and dummy material links", () => {
    expect(placeholderReason("A1", { title: "A1 — Grundlagen", description: null })).not.toBeNull();
    expect(placeholderReason("A1", { title: "Anything", description: "Modul 2 für Deutsch A1 — Anfänger." })).not.toBeNull();
    expect(placeholderReason("A1", { title: "Grundlagen", description: "Units 1–5 · Deutsch_A1_Kursbuch.pdf" })).toBeNull();
    expect(isDummyUrl("https://sparch.rw/materials/notes.pdf")).toBe(true);
    expect(isDummyUrl("https://example.com/qa-dictionary")).toBe(true);
    expect(isDummyUrl("/api/uploads/abc.pdf")).toBe(false);
  });
});
