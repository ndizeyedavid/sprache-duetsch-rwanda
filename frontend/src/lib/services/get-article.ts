import { apiGet } from '.././api';
import type { Article } from './article';
export function getArticle(slug: string): Promise<Article> {
  return apiGet<Article>(`/articles/articles/${slug}`);
}
