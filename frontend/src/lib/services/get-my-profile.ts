import { apiGet } from '.././api';
import type { MyProfile } from './my-profile';
export function getMyProfile(): Promise<MyProfile> {
  return apiGet<MyProfile>('/students/me');
}
