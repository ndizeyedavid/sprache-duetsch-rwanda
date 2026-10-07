import { apiGet } from '.././api';
export function getMyEnrollments(): Promise<
  { id: string; status: string; level: { code: string; title: string }; classGroup: { name: string; shift: string } | null }[]
> {
  return apiGet('/enrollments/me');
}
