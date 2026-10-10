import { apiGet } from '.././api';
import type { MyPeople } from './my-people';
export function getMyPeople(): Promise<MyPeople> {
  return apiGet<MyPeople>('/students/me/people');
}
