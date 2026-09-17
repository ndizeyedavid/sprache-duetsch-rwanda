import { FRIENDLY_TYPES } from './constants';
import type { FriendlyType } from './constants';

type Props = { value: FriendlyType; onChange: (v: FriendlyType) => void };

export function QuestionTypePicker({ value, onChange }: Props) {
 return (
 <div>
 <span className="mb-2 block text-xs font-medium">Question type *</span>
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
 {FRIENDLY_TYPES.map((t) => {
 const Icon = t.icon;
 const active = value === t.value;
 return (
 <button
 key={t.value}
 type="button"
 onClick={() => onChange(t.value as FriendlyType)}
 aria-pressed={active}
 className={`flex flex-col items-start gap-1.5 rounded-box border p-3 text-left transition ${active ? 'border-brand bg-brand-soft' : 'border-line bg-base-100 hover:border-brand/30 hover:bg-base-200/50'}`}
 >
 <span className={`flex size-8 items-center justify-center rounded-full ${active ? 'bg-brand text-white' : 'bg-base-200 text-muted'}`}>
 <Icon aria-hidden className="text-sm" />
 </span>
 <span className={`text-xs font-semibold leading-tight ${active ? 'text-[#B30A00]' : ''}`}>{t.label}</span>
 <span className="text-[11px] leading-snug text-muted">{t.hint}</span>
 </button>
 );
 })}
 </div>
 </div>
 );
}
