import type { ReactNode } from 'react';

type TimelineProps = {
  children: ReactNode;
  className?: string;
};

/** Dashed-rail wrapper for the "Today Schedule" and Activity vertical timelines. */
export function Timeline({ children, className = '' }: TimelineProps) {
  return <div className={`relative pl-4 ${className}`}>{children}</div>;
}

type TimelineSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function TimelineSection({ title, children, className = '' }: TimelineSectionProps) {
  return (
    <div className={className}>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <ul className="space-y-0">{children}</ul>
    </div>
  );
}
