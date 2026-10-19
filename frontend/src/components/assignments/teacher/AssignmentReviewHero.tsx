import type { ReactNode } from 'react';
import { FiArrowLeft,FiCheckSquare,FiDownload,FiEdit2 } from 'react-icons/fi';
import { heroAction,heroGhost } from '../../hero/hero-actions';
import { PageHero } from '../../hero/PageHero';
import { dateLabel } from '../homework/format';
import type { Homework } from '../homework/types';

type Props = {
  assignment?: Homework; assigned?: number; extensions?: number; busy?: boolean; exporting?: boolean;
  onBack: () => void; onDownload?: () => void; onEdit?: () => void; footer?: ReactNode;
};

/** Red header for reviewing one homework task: what it is, when it is due, and the review actions. */
export function AssignmentReviewHero({ assignment: a, assigned = 0, extensions = 0, busy, exporting, onBack, onDownload, onEdit, footer }: Props) {
  const back = <button type="button" className={heroGhost} disabled={busy} onClick={onBack}><FiArrowLeft aria-hidden />All assignments</button>;
  if (!a) return <PageHero compact eyebrow="Homework review" icon={FiCheckSquare} title="Class submissions" art="grades" actions={back} />;
  return (
    <PageHero compact eyebrow={`Homework review · ${a.classGroup.level.code} · ${a.classGroup.name}`} icon={FiCheckSquare} art="grades" title={a.title}
      description={`Due ${dateLabel(a.dueAt, true)} · ${a.maxPoints} points · ${assigned} assigned students${extensions ? ` · ${extensions} with an extension` : ''}${a.lesson ? ` · Practises ${a.lesson.title}` : ''}`}
      meta={<span className="hero-chip">{a.status.charAt(0) + a.status.slice(1).toLowerCase()}</span>}
      actions={<>
        <button type="button" className={heroAction} disabled={busy} onClick={onEdit}><FiEdit2 aria-hidden />Edit task</button>
        <button type="button" className={heroGhost} disabled={exporting} onClick={onDownload}><FiDownload aria-hidden />{exporting ? 'Downloading…' : 'Download results'}</button>
        {back}
      </>}
      footer={footer} />
  );
}
