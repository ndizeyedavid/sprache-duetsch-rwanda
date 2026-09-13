import type { Article } from '../../types';

type ArticleCardProps = {
  article: Article;
  className?: string;
};

export function ArticleCard({ article, className = '' }: ArticleCardProps) {
  return (
    <article className={`flex gap-4 ${className}`}>
      <img
        src={article.image}
        alt={article.title}
        loading="lazy"
        className="size-24 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{article.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{article.excerpt}</p>
        <p className="mt-2 text-[11px] text-muted">
          {article.author} - {article.date}
        </p>
      </div>
    </article>
  );
}
