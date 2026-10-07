import { apiGet } from '.././api';
import type { MyCourse } from './my-course';
export function getMyCourses(): Promise<MyCourse[]> {
  return apiGet<MyCourse[]>('/content/my/courses');
}
