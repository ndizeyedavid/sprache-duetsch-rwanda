import type { LevelItem } from "../../lib/services";

export type CurriculumManagerProps = {
  levels: LevelItem[];
  canCreateLevel: boolean;
  onLevelsChanged?: () => void;
};

export type ActivityQuestion =
  | { kind: "FILL_BLANK"; sentence: string; answer: string }
  | { kind: "TRUE_FALSE"; statement: string; correct: boolean }
  | { kind: "WRITING"; prompt: string; minWords: string }
  | { kind: "MCQ"; question: string; options: string[]; correctIndex: number }
  | { kind: "DOCUMENT"; prompt: string; allowedTypes: string };
