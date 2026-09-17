import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

type PaginationProps = {
 page: number;
 pages: number;
 from: number;
 to: number;
 total: number;
 onChange?: (page: number) => void;
};

export function Pagination({ page, pages, from, to, total, onChange }: PaginationProps) {
 const numbers = Array.from({ length: pages }, (_, index) => index + 1);

 return (
 <div className="flex flex-col items-center justify-between gap-4 pt-5 sm:flex-row">
 <p className="text-xs text-muted">
 Showing {from}-{to} from {total} data
 </p>
 <nav className="flex items-center gap-1" aria-label="Pagination">
 <button
 type="button"
 className="btn btn-ghost btn-sm btn-circle text-muted"
 aria-label="Previous page"
 disabled={page === 1}
 onClick={() => onChange?.(page - 1)}
 >
 <FiChevronLeft aria-hidden />
 </button>
 {numbers.map((value) => (
 <button
 key={value}
 type="button"
 aria-current={value === page ? 'page' : undefined}
 onClick={() => onChange?.(value)}
 className={`btn btn-sm btn-circle border-0 text-xs font-medium ${
 value === page ? 'bg-brand text-white' : 'bg-brand-tint text-ink hover:bg-brand-soft'
 }`}
 >
 {value}
 </button>
 ))}
 <button
 type="button"
 className="btn btn-ghost btn-sm btn-circle text-muted"
 aria-label="Next page"
 disabled={page === pages}
 onClick={() => onChange?.(page + 1)}
 >
 <FiChevronRight aria-hidden />
 </button>
 </nav>
 </div>
 );
}
