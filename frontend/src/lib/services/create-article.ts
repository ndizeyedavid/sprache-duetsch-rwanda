import { apiPost } from '.././api';
import type { Article } from './article';
export function createArticle(body: Record<string, unknown>): Promise<Article> {
  return apiPost<Article>('/articles/articles', body);
}
