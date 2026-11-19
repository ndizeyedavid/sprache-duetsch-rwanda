import { describe,expect,it } from 'vitest';
import type { GlossaryMap } from './tokens';
import { groupWords,lookup,tokenize } from './tokens';

const glossary: GlossaryMap = { 'guten Tag': ['hello'], 'ich': ['I'], 'Name': ['name', 'der Name'], 'heiße': ['am called', 'heißen'] };

describe('tokenize', () => {
  it('keeps punctuation and inner apostrophes or hyphens', () => {
    expect(tokenize("Wie geht's, Tom?").map((token) => token.text)).toEqual(['Wie', ' ', "geht's", ', ', 'Tom', '?']);
    expect(tokenize('T-O-M!').filter((token) => token.word).map((token) => token.text)).toEqual(['T-O-M']);
  });
});

describe('lookup', () => {
  it('finds sentence-start, lower-case and noun forms', () => {
    expect(lookup(glossary, 'Ich')).toEqual(['I']);
    expect(lookup(glossary, 'Guten Tag')).toEqual(['hello']);
    expect(lookup(glossary, 'name')).toEqual(['name', 'der Name']);
    expect(lookup(glossary, 'Hund')).toBeUndefined();
  });
});

describe('groupWords', () => {
  it('prefers a multi-word entry over its single words', () => {
    const groups = groupWords(tokenize('Guten Tag, ich heiße Amina.'), glossary);
    expect(groups.map((group) => [group.key, group.entry?.[0] ?? null])).toEqual([
      ['Guten Tag', 'hello'], ['ich', 'I'], ['heiße', 'am called'], ['Amina', null],
    ]);
  });
});
