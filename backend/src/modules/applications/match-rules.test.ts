import { describe,expect,it } from "vitest";
import { matchReasons,nameWords,phoneKey,sameName } from "./match-rules.js";

const person = (firstName: string, lastName: string, email: string | null = null, phone: string | null = null) => ({ firstName, lastName, email, phone });

describe("applicant matching", () => {
  it("reads Rwandan phone numbers in any common format", () => {
    expect(phoneKey("+250 788 123 456")).toBe("788123456");
    expect(phoneKey("0788123456")).toBe("788123456");
    expect(phoneKey("788-123-456")).toBe("788123456");
    expect(phoneKey("12345")).toBeNull();
  });

  it("matches names in any order and with extra names, but not single shared words", () => {
    expect(sameName(nameWords("Octave", "Nkurunziza"), nameWords("Nkurunziza octave", "heureux"))).toBe(true);
    expect(sameName(nameWords("UMULISA", "BENITHA"), nameWords("Umulisa", "Benitha"))).toBe(true);
    expect(sameName(nameWords("Josiane", "Irasubiza"), nameWords("Irasubiza", "Josiane"))).toBe(true);
    expect(sameName(nameWords("Aline", "Uwase"), nameWords("Aline", "Mukamana"))).toBe(false);
    expect(sameName(nameWords("Éric", "Habimana"), nameWords("Eric", "HABIMANA"))).toBe(true);
  });

  it("explains each match", () => {
    expect(matchReasons(person("Keza", "Belyse", "keza@x.rw", "0788123456"), person("Belyse", "Keza", "KEZA@x.rw ", "+250788123456"))).toEqual(["email", "phone", "name"]);
    expect(matchReasons(person("Keza", "Belyse", "a@x.rw"), person("Aline", "Uwase", "b@x.rw"))).toEqual([]);
  });
});
