import { FiAward, FiClipboard, FiClock, FiEdit2, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { humanize, money } from '../../lib/services';
import { ASSESSMENT_ICON } from './constants';
import { RowMenu } from './RowMenu';

type Props = {
 assessment: { id: string; title: string; type: string; levelId: string; durationMinutes: number | null; maxAttempts: number | null; passMark: unknown; isPublished: boolean };
 levelCode: string;
 questionCount?: number;
 onEdit: () => void;
 onDelete: () => void;
 onTogglePublish: () => void;
 publishing?: boolean;
};

export function AssessmentCard({ assessment, levelCode, questionCount, onEdit, onDelete, onTogglePublish, publishing }: Props) {
 const Icon = ASSESSMENT_ICON[assessment.type] ?? FiAward;
 const navigate = useNavigate();
 return (
 <div className={`flex gap-3 border-l-4 bg-base-100 px-4 py-3 ${assessment.isPublished ? 'border-brand' : 'border-line opacity-90'}`}>
 <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${assessment.isPublished ? 'bg-brand-soft text-brand' : 'bg-base-200 text-muted'}`}>
 <Icon aria-hidden className="text-sm" />
 </span>
 <div className="min-w-0 grow">
 <p className="truncate text-sm font-semibold leading-tight">{assessment.title}</p>
 <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
 <span className="rounded-full bg-base-200 px-2 py-0.5 font-medium">{levelCode}</span>
 <span>{humanize(assessment.type)}</span>
 <span>· pass {money(assessment.passMark as string)}%</span>
 {assessment.durationMinutes ? <span className="inline-flex items-center gap-1"><FiClock aria-hidden />{assessment.durationMinutes} min</span> : null}
 {assessment.maxAttempts ? <span>· {assessment.maxAttempts} attempt{assessment.maxAttempts === 1 ? '' : 's'}</span> : null}
 {typeof questionCount === 'number' ? <span>· {questionCount} question{questionCount === 1 ? '' : 's'}</span> : null}
 </p>
 </div>
 <span className="flex shrink-0 items-center gap-1 self-start">
 {publishing ? <span className="loading loading-spinner loading-xs text-brand" aria-label="Saving" /> : null}
 <RowMenu
 label={`Actions for ${assessment.title}`}
 items={[
 { label: 'View submissions', icon: FiClipboard, onClick: () => navigate(`/teacher/grading?assessmentId=${assessment.id}`) },
 { label: assessment.isPublished ? 'Unpublish' : 'Publish', icon: assessment.isPublished ? FiEyeOff : FiEye, onClick: onTogglePublish, disabled: publishing },
 { label: 'Edit assessment', icon: FiEdit2, onClick: onEdit },
 { label: 'Delete assessment', icon: FiTrash2, onClick: onDelete, tone: 'danger' },
 ]}
 />
 </span>
 </div>
 );
}
