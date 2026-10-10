import { apiGet } from '.././api';
import type { FaqItem } from './faq-item';
export function listFaqs(): Promise<FaqItem[]> {
  return apiGet<FaqItem[]>('/articles/faqs');
}
