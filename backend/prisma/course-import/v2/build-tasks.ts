// Lesson pack → flashcards (self-study), writing and speaking tasks (teacher-reviewed).
// Writing keeps the v1 activity id (`writing:<nr>`) so earlier submissions stay attached.
import type { Prisma } from "../../../src/generated/prisma/client.js";
import { spokenHeadword } from "./audio.js";
import type { AudioCollector } from "./audio.js";
import type { LessonPack } from "./pack-schema.js";

export type TaskActivity = {
  key: string;
  title: string;
  type: "FLASHCARD" | "WRITING" | "SPEAKING";
  instructions: string;
  order: number;
  config: Prisma.InputJsonObject;
};

const bullets = (lines: string[]) => lines.map((line) => `• ${line}`).join("\n");

export function flashcardTask(pack: LessonPack, audio: AudioCollector): TaskActivity {
  return {
    key: `flashcards:${pack.lesson}`,
    title: "Wortschatz · Lernkarten",
    type: "FLASHCARD",
    instructions: `Learn the ${pack.vocab.length} words of this lesson: listen, turn each card and read the example.`,
    order: 0,
    config: {
      courseV2: true,
      cards: pack.vocab.map((word) => ({
        front: word.de, back: word.en, example: `${word.example}\n${word.exampleEn}`,
        audioUrl: audio.say(word.de, "m", spokenHeadword(word.say ?? word.de)) ?? null,
      })),
    },
  };
}

/** Teacher-graded: no practiceMode, so it reaches the grading queue; the model answer shows after submitting. */
export function writingTask(pack: LessonPack): TaskActivity[] {
  const task = pack.writing;
  if (!task) return [];
  const instruction = [task.task, `Umfang: ${task.wordRange}`, "Checkliste:", bullets(task.checklist.map((point) => point.de))].join("\n");
  return [{
    key: `writing:${pack.lesson}`,
    title: "Schreibaufgabe",
    type: "WRITING",
    instructions: instruction,
    order: 30,
    config: {
      courseV2: true,
      courseTask: true,
      prompt: instruction,
      promptEn: [task.taskEn, `Length: ${task.wordRange.replace("Wörter", "words")}`, "Checklist:", bullets(task.checklist.map((point) => point.en))].join("\n"),
      minWords: Number(task.wordRange.match(/\d+/)?.[0] ?? 0),
      wordRange: task.wordRange,
      checklist: task.checklist.map((point) => point.de),
      modelAnswer: task.modelAnswer,
      modelAnswerEn: task.modelAnswerEn,
    },
  }];
}

/** Recorded answer for the teacher; the model answer (with audio) shows after submitting. */
export function speakingTask(pack: LessonPack, audio: AudioCollector): TaskActivity[] {
  const task = pack.speaking;
  if (!task) return [];
  const prompt = [task.task, bullets(task.prompts.map((line) => line.de))].join("\n");
  return [{
    key: `v2:speaking:${pack.lesson}`,
    title: "Sprechaufgabe",
    type: "SPEAKING",
    instructions: prompt,
    order: 31,
    config: {
      courseV2: true,
      courseTask: true,
      prompt,
      promptEn: [task.taskEn, bullets(task.prompts.map((line) => line.en))].join("\n"),
      maxSeconds: 120,
      modelAnswer: task.modelAnswer,
      modelAnswerEn: task.modelAnswerEn,
      modelAudioUrl: audio.say(task.modelAnswer, "f") ?? null,
    },
  }];
}
