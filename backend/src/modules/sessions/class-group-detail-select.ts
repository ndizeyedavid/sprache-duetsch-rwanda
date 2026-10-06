import { briefCampus } from './brief-campus.js';
import { briefIntake } from './brief-intake.js';
import { briefLevel } from './brief-level.js';
export const classGroupDetailSelect = {
  id: true,
  name: true,
  level: briefLevel,
  intake: briefIntake,
  campus: briefCampus,
} as const;
