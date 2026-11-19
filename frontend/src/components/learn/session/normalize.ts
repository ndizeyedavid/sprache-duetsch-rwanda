// Answer comparison for practice sessions. German is checked strictly (grammar is the point), apart
// from capital letters, punctuation and typing "ae/oe/ue/ss" for ä/ö/ü/ß. English answers forgive
// contractions ("I'm" = "I am") and a one-letter typo in a longer word.
const CONTRACTIONS: [RegExp, string][] = [
  [/\bi'm\b/g, 'i am'], [/\byou're\b/g, 'you are'], [/\bwe're\b/g, 'we are'], [/\bthey're\b/g, 'they are'],
  [/\bhe's\b/g, 'he is'], [/\bshe's\b/g, 'she is'], [/\bit's\b/g, 'it is'], [/\bthat's\b/g, 'that is'],
  [/\bwhat's\b/g, 'what is'], [/\bwhere's\b/g, 'where is'], [/\bwho's\b/g, 'who is'], [/\bhow's\b/g, 'how is'],
  [/\bthere's\b/g, 'there is'], [/\bisn't\b/g, 'is not'], [/\baren't\b/g, 'are not'], [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'], [/\bdidn't\b/g, 'did not'], [/\bcan't\b/g, 'cannot'], [/\bcan not\b/g, 'cannot'],
  [/\bwon't\b/g, 'will not'], [/\bi've\b/g, 'i have'], [/\byou've\b/g, 'you have'], [/\bwe've\b/g, 'we have'],
  [/\bi'll\b/g, 'i will'], [/\byou'll\b/g, 'you will'], [/\bi'd\b/g, 'i would'], [/\blet's\b/g, 'let us'],
  [/\bwasn't\b/g, 'was not'], [/\bweren't\b/g, 'were not'], [/\bhaven't\b/g, 'have not'], [/\bhasn't\b/g, 'has not'],
];

export type Lang = 'de' | 'en';

export function normalize(text: string, lang: Lang): string {
  let value = text.normalize('NFC').toLowerCase().replace(/[’‘`´]/g, "'").replace(/[„“”"«»]/g, '');
  if (lang === 'en') for (const [pattern, full] of CONTRACTIONS) value = value.replace(pattern, full);
  return value.replace(/[.,!?;:()…–—-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export const foldUmlauts = (value: string) => value.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');

/** Edit distance where swapping two neighbouring letters ("langauge") counts as one typo. */
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** Same words, except at most one word of 5+ letters that is one letter off. */
function oneTypo(given: string, expected: string): boolean {
  const a = given.split(' '), b = expected.split(' ');
  if (a.length !== b.length) return false;
  const different = a.map((word, index) => [word, b[index]]).filter(([x, y]) => x !== y);
  return different.length === 1 && different[0][1].length >= 5 && distance(different[0][0], different[0][1]) === 1;
}

export type TextCheck = { correct: boolean; matched?: string; note?: string };

export function checkText(given: string, answers: string[], lang: Lang): TextCheck {
  const typed = normalize(given, lang);
  if (!typed) return { correct: false };
  const options = answers.map((answer) => ({ answer, plain: normalize(answer, lang) }));
  const exact = options.find((option) => option.plain === typed);
  if (exact) return { correct: true, matched: exact.answer };
  if (lang === 'de') {
    const folded = options.find((option) => foldUmlauts(option.plain) === foldUmlauts(typed));
    if (folded) return { correct: true, matched: folded.answer, note: `Use the German letters: ${folded.answer}` };
    return { correct: false };
  }
  const typo = options.find((option) => oneTypo(typed, option.plain));
  return typo ? { correct: true, matched: typo.answer, note: `Watch the spelling: ${typo.answer}` } : { correct: false };
}

/** Share of the target's words heard in a speech transcript (order-free). */
export function spokenMatch(transcript: string, target: string): number {
  const heard = new Set(foldUmlauts(normalize(transcript, 'de')).split(' '));
  const words = foldUmlauts(normalize(target, 'de')).split(' ').filter(Boolean);
  return words.length ? words.filter((word) => heard.has(word)).length / words.length : 0;
}
