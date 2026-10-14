import type { FormEvent } from 'react';
import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { createArticle,getArticle,isoDate,listArticles,uploadFile } from '../../lib/services';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';
import { Modal } from '../ui/Modal';
import { Panel,SectionHeader } from '../ui/Panel';
export function ResourceArticles({ isStaff }: { isStaff: boolean }) {
 const articles = useApi('articles', () => listArticles());
 const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
 const [title, setTitle] = useState('');
 const [excerpt, setExcerpt] = useState('');
 const [body, setBody] = useState('');
 const [coverUrl, setCoverUrl] = useState('');
 const [uploading, setUploading] = useState(false);
 const [formError, setFormError] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);
 const [creating, setCreating] = useState(false);
 const [success, setSuccess] = useState<string | null>(null);

 const detail = useApi(
 `article-${selectedSlug ?? 'none'}`,
 () => getArticle(selectedSlug ?? ''),
 selectedSlug !== null,
 );

 async function handleCover(event: React.ChangeEvent<HTMLInputElement>) {
 const file = event.currentTarget.files?.[0];
 if (!file) return;
 setFormError(null);
 setUploading(true);
 try {
 const result = await uploadFile(file);
 setCoverUrl(result.url);
 } catch (err) {
 setFormError(apiErrorMessage(err, 'Could not upload the cover image.'));
 } finally {
 setUploading(false);
 }
 }

 async function handleCreate(event: FormEvent) {
 event.preventDefault();
 setFormError(null);
 setSaving(true); setSuccess(null);
 try {
 await createArticle({
 title: title.trim(),
 excerpt: excerpt.trim() || undefined,
 body: body.trim(),
 coverImageUrl: coverUrl || undefined,
 isPublished: true,
 });
 setTitle('');
 setExcerpt('');
 setBody('');
 setCoverUrl('');
 articles.refetch(); setSuccess('Article published.'); setCreating(false);
 } catch (err) {
 setFormError(apiErrorMessage(err, 'Could not publish the article.'));
 } finally {
 setSaving(false);
 }
 }

 const list = articles.data ?? [];

 return (
 <div className="grid gap-5 lg:grid-cols-2">
 <Panel>
<div className="mb-4 flex flex-wrap items-start justify-between gap-3"><SectionHeader title={`Articles (${list.length})`} className="mb-0" />{isStaff && <button className="btn btn-sm rounded-full" onClick={() => { setCreating(true); setFormError(null); }}>Publish article</button>}</div>
 {success && <p role="status" className="mb-4 text-xs">{success}</p>}
 {articles.loading ? (
 <LoadingBlock label="Loading articles…" />
 ) : articles.error ? (
 <ErrorBlock message={articles.error} onRetry={articles.refetch} />
 ) : list.length === 0 ? (
 <EmptyBlock title="No articles yet" hint="Learning guides and exam tips will appear here." />
 ) : (
 <ul className="space-y-2">
 {list.map((article) => (
 <li key={article.id}>
 <button
 type="button"
 onClick={() => setSelectedSlug(article.slug)}
 className={`w-full rounded-field p-3 text-left transition-colors ${
 selectedSlug === article.slug ? 'bg-brand text-primary-content' : 'bg-base-200 hover:bg-brand hover:text-primary-content'
 }`}
 >
 <span className="block truncate text-xs font-semibold">{article.title}</span>
 <span className="mt-1 block text-[11px] text-muted">
 {article.author ? `${article.author.firstName} ${article.author.lastName} · ` : ''}
 {isoDate(article.publishedAt ?? article.createdAt)}
 </span>
 </button>
 </li>
 ))}
 </ul>
 )}

 {isStaff ? (
 <Modal open={creating} onClose={() => setCreating(false)} title="Publish article" boxClassName="max-w-2xl"><form onSubmit={handleCreate} className="space-y-3">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Title</span>
 <input required value={title} onChange={(event) => setTitle(event.currentTarget.value)} placeholder="e.g. How to prepare for the A1 exam" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Excerpt</span>
 <input value={excerpt} onChange={(event) => setExcerpt(event.currentTarget.value)} placeholder="Short summary shown in article list (optional)" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Cover image (optional)</span>
 <input
 type="file"
 accept="image/png,image/jpeg,image/webp"
 onChange={handleCover}
 disabled={uploading}
 className="file-input file-input w-full rounded-field border-line bg-base-200"
 />
 </label>
 {uploading ? <p className="text-xs text-muted">Uploading…</p> : null}
 {coverUrl ? (
 <img src={coverUrl} alt="Article cover preview" className="h-24 w-full rounded-field object-cover" />
 ) : null}
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Body</span>
 <textarea required value={body} onChange={(event) => setBody(event.currentTarget.value)} placeholder="Write the full article — plain text, line breaks are kept..." rows={4} className="textarea w-full rounded-field border-line bg-base-200" />
 </label>
 {formError ? (
 <p role="alert" className="text-xs font-medium text-error">
 {formError}
 </p>
 ) : null}
 <button type="submit" disabled={saving || uploading} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60">
 Publish
 </button>
 </form></Modal>
 ) : null}
 </Panel>

 <Panel>
 {!selectedSlug ? (
 <EmptyBlock title="Select an article" hint="Choose an article on the left to read it." />
 ) : detail.loading ? (
 <LoadingBlock label="Loading article…" />
 ) : detail.error || !detail.data ? (
 <ErrorBlock message={detail.error ?? 'Could not load this article.'} onRetry={detail.refetch} />
 ) : (
 <article>
 {detail.data.coverImageUrl ? (
 <img src={detail.data.coverImageUrl} alt="" className="mb-4 aspect-video w-full rounded-box object-cover" />
 ) : null}
 <h1 className="text-xl font-semibold">{detail.data.title}</h1>
 <p className="mt-1 text-[11px] text-muted">
 {detail.data.author ? `${detail.data.author.firstName} ${detail.data.author.lastName} · ` : ''}
 {isoDate(detail.data.publishedAt ?? detail.data.createdAt)}
 </p>
 {detail.data.excerpt ? (
 <p className="mt-3 text-sm font-medium leading-relaxed">{detail.data.excerpt}</p>
 ) : null}
 <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{detail.data.body}</p>
 </article>
 )}
 </Panel>
 </div>
 );
}

