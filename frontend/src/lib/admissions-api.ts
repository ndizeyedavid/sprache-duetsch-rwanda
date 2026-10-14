import type {
ApplicationDetail,
ApplicationFilters,
ApplicationPayload,
ApplicationReceipt,
ApplicationRow,
ApplicationStatus,
Catalog,
Paged,
StudentFromApplication,
WaitlistGroup,
} from './admissions-types';
import { api,apiGet,apiPatch,apiPost } from './api';

/** Drop blank filters so the query string only carries real choices. */
function query(filters: ApplicationFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}

/** Public: published levels, open intakes, campuses and shifts. */
export function getCatalog(): Promise<Catalog> {
  return apiGet<Catalog>('/catalog');
}

/** Public: submit the catalogue application form. */
export function submitApplication(body: ApplicationPayload): Promise<ApplicationReceipt> {
  return apiPost<ApplicationReceipt>('/applications', body);
}

/** Paginated queue; keeps `meta` because the list is paged server-side. */
export async function listApplications(filters: ApplicationFilters): Promise<Paged<ApplicationRow>> {
  const { data } = await api.get<{ success: boolean } & Paged<ApplicationRow>>(`/applications${query(filters)}`);
  return { data: data.data, meta: data.meta };
}

export function getApplicationSummary(filters: ApplicationFilters): Promise<Record<ApplicationStatus, number>> {
  const scope: ApplicationFilters = { ...filters, status: undefined, page: undefined, pageSize: undefined };
  return apiGet<Record<ApplicationStatus, number>>(`/applications/summary${query(scope)}`);
}

export function getApplication(id: string): Promise<ApplicationDetail> {
  return apiGet<ApplicationDetail>(`/applications/${id}`);
}

export function getWaitlist(filters: { levelId?: string; intakeId?: string } = {}): Promise<WaitlistGroup[]> {
  return apiGet<WaitlistGroup[]>(`/applications/waitlist${query(filters)}`);
}

export function updateApplication(id: string, body: Partial<Pick<ApplicationRow, 'levelId' | 'intakeId' | 'campusId' | 'shift' | 'phone'>>): Promise<ApplicationRow> {
  return apiPatch<ApplicationRow>(`/applications/${id}`, body);
}

export function transitionApplication(id: string, status: ApplicationStatus, reason?: string): Promise<ApplicationRow> {
  return apiPost<ApplicationRow>(`/applications/${id}/status`, { status, reason: reason || undefined });
}

export function createStudentFromApplication(id: string, body: { enroll?: boolean; classGroupId?: string; windowOverrideReason?: string }): Promise<StudentFromApplication> {
  return apiPost<StudentFromApplication>(`/applications/${id}/student`, body);
}
