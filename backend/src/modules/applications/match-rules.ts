// When two people records are probably the same person: the same email, the same phone (last nine
// digits, so "+250 788 123 456", "0788123456" and "788123456" agree) or the same name in any order
// (every word of the shorter name appears in the longer one, at least two words, accents ignored).
export type MatchVia = "email" | "phone" | "name";
export type Person = { email: string | null; phone: string | null; firstName: string; lastName: string };

export const emailKey = (value: string | null | undefined): string | null => value?.trim().toLowerCase() || null;

export const phoneKey = (value: string | null | undefined): string | null => {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length >= 9 ? digits.slice(-9) : null;
};

export const nameWords = (firstName: string, lastName: string): string[] => [...new Set(
  `${firstName} ${lastName}`.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().split(/[^\p{L}]+/u).filter((word) => word.length >= 2),
)];

export function sameName(a: string[], b: string[]): boolean {
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return short.length >= 2 && short.every((word) => long.includes(word));
}

/** Why `a` and `b` look like one person; empty when they don't. */
export function matchReasons(a: Person, b: Person): MatchVia[] {
  const reasons: MatchVia[] = [];
  const email = emailKey(a.email);
  if (email && email === emailKey(b.email)) reasons.push("email");
  const phone = phoneKey(a.phone);
  if (phone && phone === phoneKey(b.phone)) reasons.push("phone");
  if (sameName(nameWords(a.firstName, a.lastName), nameWords(b.firstName, b.lastName))) reasons.push("name");
  return reasons;
}
