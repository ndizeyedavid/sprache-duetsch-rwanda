import { apiPost } from '.././api';
import type { StaffPlacementResult } from './placement-types';

/** Staff-entered (MANUAL) placement; optionally decided at once (override needs a reason). */
export function runPlacement(
  studentId: string,
  body: { score: number; assignedLevelId?: string; overrideReason?: string; note?: string },
): Promise<StaffPlacementResult> {
  return apiPost(`/students/${studentId}/placement`, body);
}
