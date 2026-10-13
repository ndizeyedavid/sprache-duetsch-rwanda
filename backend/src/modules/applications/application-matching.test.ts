import { describe,expect,it } from "vitest";
import { matchLevel,matchShift } from "./application-matching.js";

const LEVELS = [
  { id: "a1", code: "A1", title: "Deutsch A1 — Anfänger" },
  { id: "b1", code: "B1", title: "Deutsch B1 — Mittelstufe" },
  { id: "beruf", code: "B1-BERUF", title: "Berufsdeutsch B1 — Pflege & Technik" },
  { id: "testdaf", code: "B2-TESTDAF", title: "TestDaF Vorbereitung" },
];

describe("matchLevel", () => {
  it("matches codes and titles from free text", () => {
    expect(matchLevel("A1", LEVELS)?.id).toBe("a1");
    expect(matchLevel("German A1 (Beginner)", LEVELS)?.id).toBe("a1");
    expect(matchLevel("a1.1 evening", LEVELS)?.id).toBe("a1");
    expect(matchLevel("TestDaF Vorbereitung", LEVELS)?.id).toBe("testdaf");
  });

  it("prefers the specialised code over its prefix", () => {
    expect(matchLevel("B1-BERUF nursing", LEVELS)?.id).toBe("beruf");
    expect(matchLevel("Level B1", LEVELS)?.id).toBe("b1");
  });

  it("returns null when nothing matches", () => {
    expect(matchLevel("", LEVELS)).toBeNull();
    expect(matchLevel(undefined, LEVELS)).toBeNull();
    expect(matchLevel("Spanish C1", LEVELS)).toBeNull();
    expect(matchLevel("AB1C", LEVELS)).toBeNull();
  });
});

describe("matchShift", () => {
  it("reads the shift from a schedule label", () => {
    expect(matchShift("Evening (17:30 – 19:30)")).toBe("EVENING");
    expect(matchShift("Morning class")).toBe("MORNING");
    expect(matchShift("Saturday only")).toBe("WEEKEND");
    expect(matchShift("Afternoon")).toBe("AFTERNOON");
    expect(matchShift("Flexible")).toBeNull();
    expect(matchShift(null)).toBeNull();
  });
});
