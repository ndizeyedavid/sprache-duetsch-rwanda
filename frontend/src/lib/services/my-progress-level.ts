export type MyProgressLevel = {
  level: { id: string; code: string; title: string; levelLabel: string; order: number };
  completionPercentage: number;
  modules: {
    id: string;
    title: string;
    order: number;
    lessons: { id: string; title: string; order: number; status: string; completedAt: string | null }[];
  }[];
};
