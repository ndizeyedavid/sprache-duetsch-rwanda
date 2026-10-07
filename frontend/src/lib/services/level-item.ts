import type { Money } from './money';
export type LevelItem = {
  coursebookUrl?: string | null;
  coursebookPages?: number | null;
  completionRules?: { minimumAttendance: number; requireHomework: boolean; homeworkPassMark: number } | null;
  id: string;
  code: string;
  language: string;
  title: string;
  levelLabel: string;
  summary: string | null;
  objectives: string[];
  order: number;
  defaultFee: Money;
  currency: string;
  isActive: boolean;
  /** Only returned by GET /levels/:id. */
  _count?: { modules: number; enrollments: number; classes: number; certificates: number };
};
