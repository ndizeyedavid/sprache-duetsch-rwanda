import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { humanize, money } from '../../lib/services';
import { DIFFICULTY_TONE, FRIENDLY_TYPES, TYPE_ICON, hydrateFriendlyType } from './constants';
import { RowMenu } from './RowMenu';

type Props = {
 question: { id: string; type: string; skill: string; difficulty: string; prompt: string; points: unknown; levelId: string; audioUrl?: string | null };
 levelCode: string;
 onEdit: () => void;
 onDelete: () => void;
};

export function QuestionCard({ question, levelCode, onEdit, onDelete }: Props) {
 const friendly = hydrateFriendlyType(question as never);
 const friendlyLabel = FRIENDLY_TYPES.find((t) => t.value === friendly)?.label ?? humanize(question.type);
 const Icon = TYPE_ICON[friendly] ?? TYPE_ICON[question.type] ?? FiEdit2;
 const tone = DIFFICULTY_TONE[question.difficulty] ?? 'bg-base-200 text-muted';
 return (
 <li className="flex gap-3 rounded-box border border-line bg-base-100 px-3 py-3 transition hover:border-brand/20 hover:">
 <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-base-200 text-muted">
 <Icon aria-hidden className="text-sm" />
 </span>
 <div className="min-w-0 grow">
 <p className="line-clamp-2 text-sm leading-snug font-medium">{question.prompt}</p>
 <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
 <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-medium">{levelCode}</span>
 <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px]">{friendlyLabel}</span>
 {question.audioUrl ? <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">♫ Audio</span> : null}
 <span className="rounded-full bg-info/10 px-2 py-0.5 text-[11px] text-info">{humanize(question.skill)}</span>
 <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>{humanize(question.difficulty)}</span>
 <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">{money(question.points as string)} pts</span>
 </div>
 </div>
 <span className="flex shrink-0 items-center gap-1 self-start">
 <RowMenu label={`Actions for question`} items={[{ label: 'Edit question', icon: FiEdit2, onClick: onEdit }, { label: 'Delete question', icon: FiTrash2, onClick: onDelete, tone: 'danger' }]} />
 </span>
 </li>
 );
}
