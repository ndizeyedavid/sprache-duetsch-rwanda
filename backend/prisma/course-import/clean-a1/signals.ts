// Heuristics that recognise test/demo leftovers. They only ever look at records the
// A1 import does not own, and every match is listed in the dry-run for review first.

const PLAIN_TEST = /^(?:test(?:ing)?|asdf\w*|foo|bar|xxx+|abc)\s*\d*$/i;
const QA_MARKER = /\b(?:qa|fixture|regression|verification|temporary|ui flow|lorem ipsum|dummy|placeholder|all question types)\b/i;
// Lower-case strings typed on the home row: "shdad", "sdadd", "hhsad", "asdf".
const HOME_ROW = /^[asdfghjkl]{4,}$/;
const DUMMY_URL = /^https?:\/\/(?:www\.)?(?:sparch\.rw\/materials\/|example\.(?:com|org|net)\b)/i;

/** Long letter runs with almost no vowels ("wertyuhjvhkfgkjgljhkhlkh"). */
function isKeyboardMash(word: string) {
  if (word.length < 10 || !/^[a-z]+$/i.test(word)) return false;
  return (word.match(/[aeiou]/gi)?.length ?? 0) / word.length < 0.15;
}

/** Why a title/text looks like a test artefact, or null when it looks like real content. */
export function testReason(...texts: (string | null | undefined)[]): string | null {
  for (const raw of texts) {
    const text = raw?.trim();
    if (!text) continue;
    if (PLAIN_TEST.test(text)) return `test title "${text}"`;
    if (HOME_ROW.test(text)) return `keyboard-mash text "${text}"`;
    // QA markers only count in title-length text; long instructions may use these words legitimately.
    const marker = text.length <= 80 ? text.match(QA_MARKER) : null;
    if (marker) return `QA marker "${marker[0]}" in "${text.slice(0, 60)}"`;
    const mash = text.split(/\s+/).find(isKeyboardMash);
    if (mash) return `keyboard-mash text "${mash}"`;
  }
  return null;
}

/** Placeholder modules written by the old seeds ("A1 — Grundlagen", "Modul 1 für …"). */
export function placeholderReason(levelCode: string, module: { title: string; description: string | null }) {
  const demoTitle = `${levelCode} — Grundlagen|${levelCode} — Aufbau & Anwendung`;
  if (new RegExp(`^(?:${demoTitle})$`).test(module.title) || /^Modul \d+ für /.test(module.description ?? "")) {
    return "demo placeholder from the old seed";
  }
  return null;
}

export const isDummyUrl = (url: string | null | undefined) => !!url && DUMMY_URL.test(url.trim());
