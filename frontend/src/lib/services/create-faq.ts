import { apiPost } from '.././api';
import type { FaqItem } from './faq-item';
export function createFaq(body: Record<string, unknown>): Promise<FaqItem> {
  return apiPost<FaqItem>('/articles/faqs', body);
}
