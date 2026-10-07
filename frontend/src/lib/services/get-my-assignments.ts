import { apiGet } from '.././api';
import type { AssignmentItem } from './assignment-item';
export function getMyAssignments(): Promise<AssignmentItem[]> {
  return apiGet<AssignmentItem[]>("/content/my/assignments");
}
