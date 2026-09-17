import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

type PanelProps = {
 children: ReactNode;
 className?: string;
 /** Panels that hold tables or media manage their own padding. */
 padded?: boolean;
};

export function Panel({ children, className = '', padded = true }: PanelProps) {
 return (
 <section className={` rounded-box bg-base-100 ${padded ? 'p-5' : ''} ${className}`}>
 {children}
 </section>
 );
}

type SectionHeaderProps = {
 title: string;
 action?: { label: string; to: string };
 className?: string;
};

export function SectionHeader({ title, action, className = '' }: SectionHeaderProps) {
 return (
 <div className={`mb-4 flex items-center justify-between gap-4 ${className}`}>
 <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
 {action ? (
 <Link
 to={action.to}
 className="flex items-center gap-1 text-xs font-medium text-brand hover:underline sm:text-sm"
 >
 {action.label}
 <FiChevronRight aria-hidden />
 </Link>
 ) : null}
 </div>
 );
}
