import type { LevelItem } from '../../lib/services';
export type CurriculumManagerProps = {
 levels: LevelItem[];
 canCreateLevel: boolean;
 onLevelsChanged?: () => void;
};
