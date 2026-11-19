// Lesson pack → Lesson.content (what the student reads), with audio URLs and the glossary subset.
import { photoPath } from "../lesson-photos/figure.js";
import type { CoursePhoto } from "../html-course/types.js";
import { spokenHeadword,usableClip,withWordAudio } from "./audio.js";
import type { AudioCollector } from "./audio.js";
import type { LessonContent } from "./content-types.js";
import { lessonGermanTexts } from "./german-texts.js";
import type { Glossary, LessonPack } from "./pack-schema.js";
import { groupWords, tokenize } from "./tokens.js";
import type { GlossaryMap } from "./tokens.js";

/** Entries for every word and phrase the lesson's German text uses, plus the words nobody translated yet. */
export function lessonGlossary(pack: LessonPack, level: Glossary): { glossary: GlossaryMap; missing: string[] } {
  const merged: GlossaryMap = { ...level, ...pack.glossary };
  const glossary: GlossaryMap = {};
  const missing = new Set<string>();
  for (const text of lessonGermanTexts(pack)) {
    for (const group of groupWords(tokenize(text), merged)) {
      if (group.entry) glossary[group.key] = group.entry;
      else missing.add(group.key);
    }
  }
  return { glossary, missing: [...missing].sort((a, b) => a.localeCompare(b, "de")) };
}

export function buildLessonContent(pack: LessonPack, photo: CoursePhoto | undefined, level: Glossary, audio: AudioCollector): LessonContent {
  const say = audio.say.bind(audio);
  const voices = pack.dialogue?.speakers ?? {};
  return {
    v: 2,
    level: pack.level,
    lesson: pack.lesson,
    titleEn: pack.titleEn,
    summary: pack.summary,
    summaryEn: pack.summaryEn,
    ...(pack.exam ? { exam: pack.exam } : {}),
    ...(photo ? { photo: { src: photoPath(photo.id), alt: photo.alt } } : {}),
    goals: pack.goals,
    vocab: pack.vocab.map((word) => ({
      de: word.de, en: word.en, audio: usableClip(say(word.de, "m", spokenHeadword(word.say ?? word.de))),
      example: word.example, exampleEn: word.exampleEn, exampleAudio: say(word.example),
      ...(word.noteEn ? { noteEn: word.noteEn } : {}),
    })),
    grammar: pack.grammar.map((topic) => ({
      ...topic,
      examples: topic.examples.map((example) => ({ ...example, audio: say(example.de) })),
    })),
    phrases: pack.phrases.map((group) => ({
      ...group, items: group.items.map((item) => ({ ...item, audio: say(item.de) })),
    })),
    ...(pack.pronunciation ? { pronunciation: {
      ...pack.pronunciation,
      examples: pack.pronunciation.examples.map(({ say: spoken, ...example }) => ({ ...example, audio: say(example.de, "m", spoken) })),
    } } : {}),
    ...(pack.dialogue ? { dialogue: {
      title: pack.dialogue.title,
      titleEn: pack.dialogue.titleEn,
      lines: pack.dialogue.lines.map(({ say: spoken, ...line }) => {
        const voice = voices[line.speaker] ?? "m";
        return { ...line, voice, audio: say(line.de, voice, spoken) };
      }),
    } } : {}),
    ...(pack.reading ? { reading: {
      title: pack.reading.title,
      titleEn: pack.reading.titleEn,
      paragraphs: pack.reading.paragraphs.map((paragraph) => paragraph.map((line) => ({ ...line, audio: say(line.de, "f") }))),
    } } : {}),
    glossary: withWordAudio(lessonGlossary(pack, level).glossary, (form) => say(form)),
  };
}
