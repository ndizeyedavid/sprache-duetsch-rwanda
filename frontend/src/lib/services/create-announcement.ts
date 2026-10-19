import { apiPost } from '.././api';
export function createAnnouncement(body: {
  title: string;
  body: string;
  audience?: 'STUDENTS' | 'STAFF' | 'ALL';
  target?: {
    levelId?: string;
    intakeId?: string;
    campusId?: string;
    classGroupId?: string;
  };
}): Promise<{ recipientCount: number; emailed: number }> {
  return apiPost<{ recipientCount: number; emailed: number }>('/notifications/announcements', body);
}
