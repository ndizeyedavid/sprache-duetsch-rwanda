import { useEffect } from 'react';
import { useShuffledOptions } from '../../../../hooks/useShuffledOptions';
import { SayButton } from '../../audio/SayButton';
import { GermanText } from '../../translate/GermanText';
import type { ChooseItem } from '../../types';
import { OptionButton } from './OptionButton';
import type { ItemViewProps } from './types';

/** Multiple choice; with `listen` the German prompt is heard, not read, until checked. */
export function ChooseView({ item, answer, setAnswer, verdict }: ItemViewProps<ChooseItem>) {
  const options = useShuffledOptions(item.options, item.id);
  const chosen = answer?.kind === 'option' ? answer.value : null;
  useEffect(() => {
    if (verdict) return;
    const keys = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (event.target instanceof HTMLInputElement || !options[index]) return;
      setAnswer({ kind: 'option', value: options[index].value });
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, [options, setAnswer, verdict]);
  const hidden = item.listen && !verdict;
  return <div className="space-y-5">
    <p className="text-sm font-semibold text-muted">{item.listen ? 'What do you hear?' : item.prompt && item.promptEn ? item.promptEn : 'Choose the right answer'}</p>
    {item.prompt ? <div className="flex items-center gap-3">
      <SayButton text={item.prompt} audio={item.audio} slow size={hidden ? 'lg' : 'md'} />
      {hidden ? <p className="text-sm text-muted">Listen, then choose.</p> : <p className="text-xl font-bold leading-snug"><GermanText text={item.prompt} /></p>}
    </div> : <p className="text-xl font-bold leading-snug">{item.promptEn}</p>}
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map(({ value }, index) => <OptionButton key={value} label={value} index={index} selected={chosen === value} disabled={!!verdict} lang={item.optionsLang}
        state={!verdict ? 'idle' : value === item.answer ? 'right' : value === chosen ? 'wrong' : 'idle'} onClick={() => setAnswer({ kind: 'option', value })} />)}
    </div>
  </div>;
}
