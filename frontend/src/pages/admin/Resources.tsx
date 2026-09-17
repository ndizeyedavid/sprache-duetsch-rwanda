import { useState } from 'react';
import type { FormEvent } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { SearchField } from '../../components/ui/SearchField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage, apiGet } from '../../lib/api';
import { fetchMe } from '../../lib/auth-store';
import {
 createArticle,
 createFaq,
 getArticle,
 humanize,
 isoDate,
 listArticles,
 listFaqs,
 listLevelModules,
 listLevels,
 uploadFile,
} from '../../lib/services';

type SearchHit = {
 id: string;
 type: string;
 title: string;
 snippet: string | null;
 levelId: string | null;
};

const TABS = ['Library', 'Articles', 'FAQs'] as const;

export function AdminResources() {
 const [tab, setTab] = useState<(typeof TABS)[number]>('Library');
 const me = useApi('auth-me', fetchMe);
 const isStaff = me.data ? me.data.role !== 'STUDENT' : false;

 return (
 <div className="space-y-5">
 <div role="tablist" aria-label="Resources" className="tabs tabs-boxed w-fit bg-base-100 p-1">
 {TABS.map((name) => (
 <button
 key={name}
 role="tab"
 aria-selected={tab === name}
 onClick={() => setTab(name)}
 className={`tab ${tab === name ? 'tab-active' : ''}`}
 >
 {name}
 </button>
 ))}
 </div>

 {tab === 'Library' ? <LibraryTab /> : null}
 {tab === 'Articles' ? <ArticlesTab isStaff={isStaff} /> : null}
 {tab === 'FAQs' ? <FaqsTab isStaff={isStaff} /> : null}
 </div>
 );
}

function LibraryTab() {
 const levels = useApi('admin-levels', listLevels);
 const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
 const [query, setQuery] = useState('');
 const [hits, setHits] = useState<SearchHit[] | null>(null);
 const [searching, setSearching] = useState(false);
 const [searchError, setSearchError] = useState<string | null>(null);

 const modules = useApi(
 `level-modules-${selectedLevelId ?? 'none'}`,
 () => listLevelModules(selectedLevelId ?? ''),
 selectedLevelId !== null,
 );

 async function handleSearch(event: FormEvent) {
 event.preventDefault();
 const needle = query.trim();
 if (needle.length < 2) {
 setSearchError('Type at least 2 characters to search.');
 return;
 }
 setSearching(true);
 setSearchError(null);
 try {
 const results = await apiGet<SearchHit[]>('/content/search', {
 params: { q: needle, pageSize: 30 },
 });
 setHits(results);
 } catch (err) {
 setSearchError(err instanceof Error ? err.message : 'Search failed.');
 } finally {
 setSearching(false);
 }
 }

 return (
 <div className="grid gap-5 lg:grid-cols-2">
 <Panel>
 <SectionHeader title="Content library" />
 <form onSubmit={handleSearch} className="space-y-2">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Search curriculum</span>
 <div className="flex gap-2">
 <div className="grow">
 <SearchField value={query} onChange={setQuery} ariaLabel="Search content" placeholder="Search modules, lessons, materials…" />
 </div>
 <button type="submit" disabled={searching} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
 {searching ? <span className="loading loading-spinner loading-sm" /> : 'Search'}
 </button>
 </div>
 </label>
 </form>
 {searchError ? (
 <ErrorBlock message={searchError} />
 ) : hits === null ? (
 <p className="mt-4 text-xs text-muted">Search the whole curriculum — modules, lessons and materials.</p>
 ) : hits.length === 0 ? (
 <div className="mt-4">
 <EmptyBlock title="No results" hint="Try a German word like “Grüße” or a topic like “Verben”." />
 </div>
 ) : (
 <ul className="mt-4 space-y-2">
 {hits.map((hit) => (
 <li key={`${hit.type}-${hit.id}`} className="rounded-field bg-base-200 px-3 py-2">
 <span className="flex items-center justify-between gap-2">
 <span className="truncate text-xs font-semibold">{hit.title}</span>
 <StatusBadge status={humanize(hit.type)} />
 </span>
 {hit.snippet ? (
 <span className="mt-1 line-clamp-2 block text-[11px] text-muted">{hit.snippet}</span>
 ) : null}
 </li>
 ))}
 </ul>
 )}
 </Panel>

 <Panel>
 <SectionHeader title="Modules by level" />
 {levels.loading ? (
 <LoadingBlock label="Loading levels…" />
 ) : levels.error || !levels.data ? (
 <ErrorBlock message={levels.error ?? 'Could not load levels.'} onRetry={levels.refetch} />
 ) : (
 <>
 <div className="flex flex-wrap gap-2">
 {levels.data.map((level) => (
 <button
 key={level.id}
 type="button"
 onClick={() => setSelectedLevelId(level.id)}
 className={`btn btn-sm rounded-full ${
 selectedLevelId === level.id ? 'border-0 bg-brand text-white' : 'border-line bg-base-200'
 }`}
 >
 {level.code}
 </button>
 ))}
 </div>
 <div className="mt-4">
 {!selectedLevelId ? (
 <EmptyBlock title="Pick a level" hint="Choose A1, A2, B1 or B2 to browse its modules." />
 ) : modules.loading ? (
 <LoadingBlock label="Loading modules…" />
 ) : modules.error ? (
 <ErrorBlock message={modules.error} onRetry={modules.refetch} />
 ) : !modules.data || modules.data.length === 0 ? (
 <EmptyBlock title="No modules yet" hint="Create modules from the Courses page." />
 ) : (
 <ul className="space-y-2">
 {modules.data.map((module) => (
 <li key={module.id} className="rounded-field bg-base-200 px-3 py-2 text-xs">
 <p className="font-semibold">{module.title}</p>
 <p className="mt-0.5 text-muted">Order {module.order}</p>
 </li>
 ))}
 </ul>
 )}
 </div>
 </>
 )}
 </Panel>
 </div>
 );
}

function ArticlesTab({ isStaff }: { isStaff: boolean }) {
 const articles = useApi('articles', () => listArticles());
 const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
 const [title, setTitle] = useState('');
 const [excerpt, setExcerpt] = useState('');
 const [body, setBody] = useState('');
 const [coverUrl, setCoverUrl] = useState('');
 const [uploading, setUploading] = useState(false);
 const [formError, setFormError] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);

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
 setSaving(true);
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
 articles.refetch();
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
 <SectionHeader title={`Articles (${list.length})`} />
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
 selectedSlug === article.slug ? 'bg-brand-tint' : 'bg-base-200 hover:bg-brand-tint/60'
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
 <form onSubmit={handleCreate} className="mt-6 space-y-3">
 <h2 className="text-sm font-semibold">Publish an article</h2>
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
 <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
 Publish
 </button>
 </form>
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

function FaqsTab({ isStaff }: { isStaff: boolean }) {
 const faqs = useApi('faqs', listFaqs);
 const [openId, setOpenId] = useState<string | null>(null);
 const [question, setQuestion] = useState('');
 const [answer, setAnswer] = useState('');
 const [formError, setFormError] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);

 async function handleCreate(event: FormEvent) {
 event.preventDefault();
 setFormError(null);
 setSaving(true);
 try {
 await createFaq({ question: question.trim(), answer: answer.trim() });
 setQuestion('');
 setAnswer('');
 faqs.refetch();
 } catch (err) {
 setFormError(apiErrorMessage(err, 'Could not add the FAQ.'));
 } finally {
 setSaving(false);
 }
 }

 const list = faqs.data ?? [];

 return (
 <div className="grid gap-5 lg:grid-cols-2">
 <Panel>
 <SectionHeader title="Frequently asked questions" />
 {faqs.loading ? (
 <LoadingBlock label="Loading FAQs…" />
 ) : faqs.error ? (
 <ErrorBlock message={faqs.error} onRetry={faqs.refetch} />
 ) : list.length === 0 ? (
 <EmptyBlock title="No FAQs yet" />
 ) : (
 <div className="space-y-2">
 {list.map((faq) => (
 <div key={faq.id} className="collapse collapse-arrow rounded-field bg-base-200">
 <input
 type="radio"
 name="faq-accordion"
 checked={openId === faq.id}
 onChange={() => setOpenId(openId === faq.id ? null : faq.id)}
 aria-label={faq.question}
 />
 <div className="collapse-title text-sm font-semibold">{faq.question}</div>
 <div className="collapse-content text-sm leading-relaxed text-muted">
 <p>{faq.answer}</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </Panel>

 {isStaff ? (
 <Panel>
 <SectionHeader title="Add an FAQ" />
 <form onSubmit={handleCreate} className="space-y-3">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Question</span>
 <input required value={question} onChange={(event) => setQuestion(event.currentTarget.value)} placeholder="e.g. How do I reset my password?" className="input input w-full rounded-field border-line bg-base-200" />
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Answer</span>
 <textarea required value={answer} onChange={(event) => setAnswer(event.currentTarget.value)} placeholder="Provide a clear, helpful answer..." rows={4} className="textarea w-full rounded-field border-line bg-base-200" />
 </label>
 {formError ? (
 <p role="alert" className="text-xs font-medium text-error">
 {formError}
 </p>
 ) : null}
 <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
 Add FAQ
 </button>
 </form>
 </Panel>
 ) : (
 <Panel>
 <h2 className="text-base font-semibold">Still stuck?</h2>
 <p className="mt-1 text-xs leading-relaxed text-muted">
 Message your teacher or an admin — answers usually arrive the same day.
 </p>
 </Panel>
 )}
 </div>
 );
}
