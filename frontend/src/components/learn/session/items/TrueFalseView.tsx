import { SayButton } from '../../audio/SayButton';
import { GermanText } from '../../translate/GermanText';
import type { TrueFalseItem } from '../../types';
import { OptionButton } from './OptionButton';
import type { ItemViewProps } from './types';

/** Richtig oder falsch? about the reading text or dialogue. */
export function TrueFalseView({ item, answer, setAnswer, verdict }: ItemViewProps<TrueFalseItem>) {
  const chosen = answer?.kind === 'bool' ? answer.value : null;
  const choices = [{ value: true, label: 'Richtig · True' }, { value: false, label: 'Falsch · False' }];
  return <div className="space-y-5">
    <p className="text-sm font-semibold text-muted">True or false?</p>
    <div className="flex items-start gap-3">
      <SayButton text={item.statement} audio={item.audio} slow size="md" />
      <p className="text-xl font-bold leading-snug"><GermanText text={item.statement} /></p>
    </div>
    <div className="grid gap-2 sm:grid-cols-2">
      {choices.map((choice, index) => <OptionButton key={choice.label} label={choice.label} index={index} selected={chosen === choice.value} disabled={!!verdict}
        state={!verdict ? 'idle' : choice.value === item.answer ? 'right' : choice.value === chosen ? 'wrong' : 'idle'} onClick={() => setAnswer({ kind: 'bool', value: choice.value })} />)}
    </div>
  </div>;
}
