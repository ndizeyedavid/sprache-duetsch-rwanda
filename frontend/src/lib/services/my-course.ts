import type { MyModule } from './my-module';
export type MyCourse = {
  paymentRequired?: boolean;
  price?: string;
  currency?: string;
  level: {
    id: string;
    code: string;
    title: string;
    levelLabel: string;
    summary: string | null;
    order: number;
  };
  modules: MyModule[];
  stats: { totalLessons: number; completedLessons: number; completionPercentage: number };
};
