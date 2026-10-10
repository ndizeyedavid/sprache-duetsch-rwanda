import type { IconType } from 'react-icons';
import { Panel } from '../ui/Panel';
import type { DetailRow } from './utils';

type Props = { title: string; icon: IconType; rows: DetailRow[] };

/** A titled label/value list; every "facts about the student" block uses it. */
export function DetailCard({ title, icon: Icon, rows }: Props) {
  return (
    <Panel>
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Icon aria-hidden className="text-brand" />{title}
      </h2>
      <dl className="mt-3 divide-y divide-line">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <dt className="shrink-0 text-xs text-muted">{row.label}</dt>
            <dd className="min-w-0 break-words text-right font-medium">
              {row.href ? <a href={row.href} className="link link-hover">{row.value}</a> : row.value}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
