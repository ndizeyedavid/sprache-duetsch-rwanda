// Pack sessions → PRACTICE activities (Duolingo-style: one question per screen, instant feedback).
import { createHash } from "node:crypto";
import { stableShuffle } from "../../../src/modules/content/activity-shuffle.js";
import { spokenHeadword } from "./audio.js";
import type { AudioCollector, VoiceKey } from "./audio.js";
import type { SessionConfig, SessionItem } from "./content-types.js";
import type { LessonPack, PracticeItem, PracticeSession } from "./pack-schema.js";

export const SESSION_ICONS: Record<PracticeSession["key"], string> = {
  words: "Wörter", grammar: "Grammatik", listen: "Hören & Sprechen", read: "Lesen", translate: "Übersetzen",
};

/** Word tiles of a sentence: no sentence punctuation, inner apostrophes kept ("I'm"). */
export function sentenceTiles(sentence: string): string[] {
  return sentence.split(/\s+/).map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")).filter(Boolean);
}

/** Up to `count` extra tiles: the author's distractors, else words from the session's other answers. */
function extraTiles(answer: string[], given: string[] | undefined, pool: string[], count: number, seed: string): string[] {
  if (given?.length) return given;
  const inAnswer = new Set(answer.map((word) => word.toLowerCase()));
  const candidates = [...new Set(pool.filter((word) => !inAnswer.has(word.toLowerCase())))];
  return stableShuffle(candidates, seed).slice(0, count);
}

const shortHash = (value: string) => createHash("sha1").update(value).digest("hex").slice(0, 8);

function itemKey(item: PracticeItem): string {
  switch (item.kind) {
    case "choose": return `${item.prompt ?? item.promptEn}|${item.answer}`;
    case "match": return item.pairs.map((pair) => pair.join("=")).join(";");
    case "translate": return `${item.from}|${item.text}`;
    case "order": return item.answer;
    case "fill": return item.text;
    case "listen": return `${item.mode}|${item.text}`;
    case "speak": return item.text;
    case "truefalse": return item.statement;
  }
}

/** Answer-language word pool per session, for distractor tiles. */
function tilePool(items: PracticeItem[], language: "de" | "en"): string[] {
  return items.flatMap((item) => {
    if (item.kind === "translate") return sentenceTiles(item.from === "de" ? (language === "en" ? item.answer : item.text) : (language === "de" ? item.answer : item.text));
    if (item.kind === "order" && language === "de") return sentenceTiles(item.answer);
    return [];
  });
}

function buildItem(item: PracticeItem, id: string, index: number, pools: Record<"de" | "en", string[]>, audio: AudioCollector): SessionItem {
  const voice: VoiceKey = index % 2 === 0 ? "m" : "f";
  const say = (text: string | undefined) => audio.say(text, voice);
  switch (item.kind) {
    case "choose": {
      const gap = item.prompt?.includes("___");
      const { id: _id, ...rest } = item;
      return { ...rest, id,
        audio: item.prompt && !gap ? say(item.prompt) : undefined,
        answerAudio: gap && item.optionsLang === "de" ? say(item.prompt!.replace("___", item.answer))
          : item.optionsLang === "de" ? say(item.answer) : undefined };
    }
    case "match":
      return { id, kind: "match", pairs: item.pairs, pairAudio: item.pairs.map(([de]) => audio.say(de, "m", spokenHeadword(de)) ?? null) };
    case "translate": {
      const answer = sentenceTiles(item.answer);
      const target = item.from === "de" ? "en" : "de";
      const tiles = stableShuffle([...answer, ...extraTiles(answer, item.distractors, pools[target], 3, id)], id);
      return { id, kind: "translate", from: item.from, text: item.text, answer: item.answer, accepted: item.accepted ?? [], tiles,
        ...(item.explanationEn ? { explanationEn: item.explanationEn } : {}),
        audio: item.from === "de" ? say(item.text) : undefined, answerAudio: item.from === "en" ? say(item.answer) : undefined };
    }
    case "order": {
      const answer = sentenceTiles(item.answer);
      const tiles = stableShuffle([...answer, ...(item.distractors ?? [])], id);
      return { id, kind: "order", answer: item.answer, en: item.en, tiles, answerAudio: say(item.answer) };
    }
    case "fill": {
      const { id: _id, ...rest } = item;
      return { ...rest, id, accepted: item.accepted ?? [], answerAudio: say(item.text.replace("___", item.answer)) };
    }
    case "listen": {
      const { id: _id, ...rest } = item;
      return { ...rest, id, audio: say(item.text) };
    }
    case "speak": return { id, kind: "speak", text: item.text, en: item.en, audio: say(item.text) };
    case "truefalse": {
      const { id: _id, ...rest } = item;
      return { ...rest, id, audio: say(item.statement) };
    }
  }
}

export function buildSession(session: PracticeSession, audio: AudioCollector): SessionConfig {
  const pools = { de: tilePool(session.items, "de"), en: tilePool(session.items, "en") };
  const seen = new Set<string>();
  const items = session.items.map((item, index) => {
    let id = item.id ?? `${session.key}-${shortHash(`${item.kind}|${itemKey(item)}`)}`;
    while (seen.has(id)) id = `${id}x`;
    seen.add(id);
    return buildItem(item, id, index, pools, audio);
  });
  return { v: 2, session: session.key, titleEn: session.titleEn, ...(session.passage ? { passage: session.passage } : {}), items };
}

export type SessionActivity = { key: string; title: string; instructions: string; order: number; config: SessionConfig };

/** One PRACTICE activity per session, ordered after the reader (orders 10, 11, …). */
export function sessionActivities(pack: LessonPack, audio: AudioCollector): SessionActivity[] {
  return pack.sessions.map((session, index) => ({
    key: `v2:session:${pack.lesson}:${session.key}`,
    title: session.title,
    instructions: `${session.titleEn} · ${session.items.length} questions`,
    order: 10 + index,
    config: buildSession(session, audio),
  }));
}
