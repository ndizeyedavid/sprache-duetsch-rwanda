import type { FormEvent } from 'react';
import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { createFaq,listFaqs } from '../../lib/services';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';
import { Modal } from '../ui/Modal';
import { Panel,SectionHeader } from '../ui/Panel';
export function ResourceFaqs({ isStaff }: { isStaff: boolean }) {
 const faqs = useApi('faqs', listFaqs);
 const [openId, setOpenId] = useState<string | null>(null);
 const [question, setQuestion] = useState('');
 const [answer, setAnswer] = useState('');
 const [formError, setFormError] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);
 const [creating, setCreating] = useState(false);
 const [success, setSuccess] = useState<string | null>(null);

 async function handleCreate(event: FormEvent) {
 event.preventDefault();
 setFormError(null);
 setSaving(true); setSuccess(null);
 try {
 await createFaq({ question: question.trim(), answer: answer.trim() });
 setQuestion('');
 setAnswer('');
 faqs.refetch(); setSuccess('FAQ published.'); setCreating(false);
 } catch (err) {
 setFormError(apiErrorMessage(err, 'Could not add the FAQ.'));
 } finally {
 setSaving(false);
 }
 }

 const list = faqs.data ?? [];

 return (
 <div className="space-y-5">
 <Panel>
<div className="mb-4 flex flex-wrap items-start justify-between gap-3"><SectionHeader title="FAQs" className="mb-0" />{isStaff && <button className="btn btn-sm rounded-full" onClick={() => { setCreating(true); setFormError(null); }}>New FAQ</button>}</div>
 {success && <p role="status" className="mb-4 text-xs">{success}</p>}
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
 <Modal open={creating} onClose={() => setCreating(false)} title="New FAQ">
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
 <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60">
 Add FAQ
 </button>
 </form>
 </Modal>
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
