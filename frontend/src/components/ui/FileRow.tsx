import { FiDownload, FiFileText } from 'react-icons/fi';

type FileRowProps = {
 name: string;
 size: string;
 className?: string;
};

export function FileRow({ name, size, className = '' }: FileRowProps) {
 return (
 <div className={`flex items-center gap-3 ${className}`}>
 <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
 <FiFileText aria-hidden />
 </span>
 <span className="min-w-0 grow">
 <span className="block truncate text-xs font-medium">{name}</span>
 <span className="block text-[11px] text-muted">{size}</span>
 </span>
 <button type="button" className="btn btn-ghost btn-xs btn-circle text-muted" aria-label={`Download ${name}`}>
 <FiDownload aria-hidden />
 </button>
 </div>
 );
}
