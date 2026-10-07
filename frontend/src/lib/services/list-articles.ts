import { apiGet } from '.././api';
import type { Article } from './article';
export function listArticles(search?: string): Promise<Article[]> {
  const query = search ? `?search=${encodeURIComponent(search)}&pageSize=30` : '?pageSize=30';
  return apiGet<Article[]>(`/articles/articles${query}`);
}
