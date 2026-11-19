// English help inside an HTML lesson (Lesson.translation, from backend prisma/course-import/translate):
// every innermost block whose text has a translation gets an English line (CSS shows it while "Show
// English" is on), and every word with a meaning becomes a tappable `.gw` span (the reader opens the
// meaning). BLOCK and normalizeText MUST match backend translate/segments.ts, which keyed the English
// by exactly this text.
import type { Glossary } from '../types';
import { groupWords,tokenize } from './tokens';

export const BLOCK = 'p,li,td,th,h1,h2,h3,h4,h5,h6,dt,dd,caption,figcaption,blockquote';

export const normalizeText = (text: string): string => text.replace(/\s+/g, ' ').trim();

/** Text French or English already shows (or a link/button) stays plain. */
const SKIP = '.en-line, [lang="fr"], [lang="en"], a, button, code';

function wrapWords(document: Document, root: Element, glossary: Glossary) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    if (node.parentElement?.closest(SKIP)) continue;
    const tokens = tokenize(node.data);
    const groups = groupWords(tokens, glossary).filter((group) => group.entry);
    if (!groups.length) continue;
    const fragment = document.createDocumentFragment();
    let at = 0;
    for (const group of groups) {
      if (group.start > at) fragment.append(tokens.slice(at, group.start).map((token) => token.text).join(''));
      const span = document.createElement('span');
      span.className = 'gw';
      span.dataset.gw = group.key;
      span.textContent = tokens.slice(group.start, group.end + 1).map((token) => token.text).join('');
      fragment.append(span);
      at = group.end + 1;
    }
    if (at < tokens.length) fragment.append(tokens.slice(at).map((token) => token.text).join(''));
    node.replaceWith(fragment);
  }
}

/** The lesson HTML with English lines and tappable words added (pure: returns a new string). */
export function annotateHtml(html: string, lines: Record<string, string>, glossary: Glossary): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const blocks = Array.from(document.body.querySelectorAll(BLOCK)).filter((element) => !element.querySelector(BLOCK));
  for (const block of blocks) {
    const en = lines[normalizeText(block.textContent ?? '')];
    wrapWords(document, block, glossary);
    if (!en) continue;
    const line = document.createElement('span');
    line.className = 'en-line';
    line.lang = 'en';
    line.textContent = en;
    block.append(line);
  }
  return document.body.innerHTML;
}
