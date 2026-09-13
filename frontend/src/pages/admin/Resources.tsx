import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { Pagination } from '../../components/ui/Pagination';
import { adminContact, articles, faqs } from '../../data/mock';

const PAGE_SIZE = 3;

export function AdminResources() {
  const [page, setPage] = useState(1);
  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.id ?? null);

  const pages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const rows = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <Panel>
          <h2 className="mb-5 text-base font-semibold sm:text-lg">Blogs</h2>
          <ul className="divide-y divide-line">
            {rows.map((article) => (
              <li key={article.id} className="py-5 first:pt-0 last:pb-0">
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
          <Pagination page={page} pages={pages} from={1} to={rows.length} total={articles.length} onChange={setPage} />
        </Panel>
      </div>

      <div className="space-y-5 xl:col-span-4">
        <div className="card-shadow rounded-box bg-brand p-5 text-white">
          <h2 className="text-base font-semibold">Contact</h2>
          <ul className="mt-4 space-y-3 text-xs leading-relaxed">
            <li className="flex gap-3">
              <FiMapPin className="mt-0.5 shrink-0 text-base" aria-hidden />
              <span>{adminContact.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <FiPhone className="shrink-0 text-base" aria-hidden />
              <a href={`tel:${adminContact.phone}`} className="hover:underline">
                {adminContact.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <FiMail className="shrink-0 text-base" aria-hidden />
              <a href={`mailto:${adminContact.email}`} className="hover:underline">
                {adminContact.email}
              </a>
            </li>
          </ul>
        </div>

        <Panel>
          <h2 className="mb-4 text-base font-semibold">FAQs</h2>
          <ul className="space-y-3">
            {faqs.map((faq) => {
              const open = faq.id === openFaq;
              return (
                <li key={faq.id} className="overflow-hidden rounded-field border border-line">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-medium">{faq.question}</span>
                    <span
                      aria-hidden
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                        open ? 'bg-brand text-white' : 'bg-base-200 text-muted'
                      }`}
                    >
                      {open ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  </button>
                  {open ? (
                    <p className="px-4 pb-4 text-xs leading-relaxed text-muted">{faq.answer}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
