import { FiBookOpen, FiFileText, FiFilm, FiLayers, FiMusic } from "react-icons/fi";
import type { ActivityQuestion } from "./types";

export function contentIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return FiFilm;
    case "AUDIO":
      return FiMusic;
    case "PDF":
      return FiFileText;
    case "MIXED":
      return FiLayers;
    default:
      return FiBookOpen;
  }
}

export function buildActivityConfig(type: string, q: ActivityQuestion, instructions: string) {
  const backendType = type === "DOCUMENT" ? "WRITING" : type;
  let config: Record<string, unknown> = { instructions };
  if (q.kind === "MCQ") {
    config = { ...config, question: q.question, options: q.options, correctIndex: q.correctIndex };
  } else if (q.kind === "FILL_BLANK") {
    config = { ...config, sentence: q.sentence, answer: q.answer };
  } else if (q.kind === "TRUE_FALSE") {
    config = { ...config, statement: q.statement, correct: q.correct };
  } else if (q.kind === "WRITING") {
    config = { ...config, prompt: q.prompt, minWords: q.minWords };
  } else if (q.kind === "DOCUMENT") {
    config = { ...config, prompt: q.prompt, allowedTypes: q.allowedTypes, isDocumentSubmission: true };
  }
  return { backendType, config };
}
