// Tap-to-translate tokenizer and glossary lookup. KEEP IN SYNC with
// frontend/src/components/learn/translate/tokens.ts — the student view must split text exactly
// like the importer's coverage check, or covered words would show "no translation".
/** [English], [English, dictionary form], or in built lesson content [English, dictionary form or "", recording URL]. */
export type Entry = [string] | [string, string] | [string, string, string];
export type GlossaryMap = Record<string, Entry>;
export type Token = { text: string; word: boolean };

/** Letters (incl. ä ö ü ß), joined by an inner apostrophe or hyphen: "geht's", "E-Mail", "T-O-M". */
const WORD = /[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*/gu;

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of text.matchAll(WORD)) {
    if (match.index > last) tokens.push({ text: text.slice(last, match.index), word: false });
    tokens.push({ text: match[0], word: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) tokens.push({ text: text.slice(last), word: false });
  return tokens;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const decapitalize = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

/**
 * Exact form first, then with a sentence-start capital removed ("Guten Tag" → "guten Tag"), then
 * all lower case, then capitalised (a noun typed in lower case).
 */
export function lookup(glossary: GlossaryMap, form: string): Entry | undefined {
  const plain = form.replace(/’/g, "'");
  const lower = plain.toLowerCase();
  return glossary[plain] ?? glossary[decapitalize(plain)] ?? glossary[lower] ?? glossary[capitalize(lower)];
}

export const MAX_PHRASE_WORDS = 3;

/**
 * Words of `text` grouped into glossary hits: a multi-word entry ("Guten Tag", "auf Wiedersehen")
 * wins over its single words when the words are separated by spaces only.
 */
export function groupWords(tokens: Token[], glossary: GlossaryMap): { start: number; end: number; key: string; entry?: Entry }[] {
  const groups: { start: number; end: number; key: string; entry?: Entry }[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    if (!tokens[i].word) continue;
    let found: { end: number; key: string; entry: Entry } | null = null;
    for (let size = MAX_PHRASE_WORDS; size > 1 && !found; size -= 1) {
      const words: string[] = [tokens[i].text];
      let j = i;
      while (words.length < size && tokens[j + 1] && !tokens[j + 1].word && tokens[j + 1].text === " " && tokens[j + 2]?.word) {
        words.push(tokens[j + 2].text);
        j += 2;
      }
      if (words.length < size) continue;
      const key = words.join(" ");
      const entry = lookup(glossary, key);
      if (entry) found = { end: j, key, entry };
    }
    if (found) { groups.push({ start: i, ...found }); i = found.end; continue; }
    groups.push({ start: i, end: i, key: tokens[i].text, entry: lookup(glossary, tokens[i].text) });
  }
  return groups;
}
