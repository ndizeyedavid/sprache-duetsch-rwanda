import { apiGet } from '.././api';
import type { Contact } from './contact';
export function listContacts(): Promise<Contact[]> {
  return apiGet<Contact[]>('/messages/contacts');
}
