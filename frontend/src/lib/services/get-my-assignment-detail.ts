import { apiGet } from '.././api';
export function getMyAssignmentDetail(id: string): Promise<{ source: string; activity?: unknown; assessment?: unknown; submission?: unknown; lesson?: unknown; level?: unknown; attempts?: unknown[] }> {
  return apiGet(`/content/my/assignments/${encodeURIComponent(id)}`);
}
