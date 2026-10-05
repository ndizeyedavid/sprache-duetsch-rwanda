import { useShuffledOptions } from '../../../hooks/useShuffledOptions';

type Props = { id: string; options: string[]; question: string; choice: number | null; onChange: (index: number) => void };

export function ActivityChoices({ id, options, question, choice, onChange }: Props) {
  const choices = useShuffledOptions(options, id);
  return <div>
    <p className="text-sm font-medium">{question}</p>
    <div className="mt-3 space-y-2">
      {choices.map(({ value, index }, position) => <button key={index} type="button" onClick={() => onChange(index)} className={`flex w-full items-center gap-3 rounded-box border px-4 py-3 text-left text-sm transition ${choice === index ? 'border-brand bg-brand-soft' : 'border-line bg-base-100 hover:border-brand/20'}`}>
        <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${choice === index ? 'border-brand bg-brand text-white' : 'border-line bg-base-200'}`}>{String.fromCharCode(65 + position)}</span>
        {value}
      </button>)}
      {!choices.length ? <p className="text-xs text-muted">No options configured — contact your teacher.</p> : null}
    </div>
  </div>;
}
