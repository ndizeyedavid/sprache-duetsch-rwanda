import { SayButton } from '../../audio/SayButton';
import { GermanText } from '../../translate/GermanText';
import type { FillItem } from '../../types';
import { OptionButton } from './OptionButton';
import { TextAnswer } from './TextAnswer';
import type { ItemViewProps } from './types';

/** Complete the sentence: type the missing word, or pick it when options are given. */
export function FillView({ item, answer, setAnswer, verdict, submit }: ItemViewProps<FillItem>) {
  const [before, after] = item.text.split('___');
  const given = answer && (answer.kind === 'text' || answer.kind === 'option') ? answer.value : '';
  const filled = verdict ? item.answer : given;
  return <div className="space-y-5">
    <p className="text-sm font-semibold text-muted">Complete the sentence</p>
    <p className="text-xl font-bold leading-relaxed">
      <GermanText text={before} />
      <span className={`mx-1 inline-block min-w-16 border-b-2 px-1 text-center ${verdict ? (verdict.correct ? 'border-ok text-ok' : 'border-bad text-bad') : 'border-primary text-primary'}`} lang="de">{filled || ' '}</span>
      <GermanText text={after} />
      {verdict ? <SayButton text={item.text.replace('___', item.answer)} audio={item.answerAudio} className="ml-2" /> : null}
    </p>
    <p className="text-sm text-muted">{item.en}{item.hintEn ? <span className="mt-1 block text-xs">Hint: {item.hintEn}</span> : null}</p>
    {item.options
      ? <div className="grid gap-2 sm:grid-cols-2">{item.options.map((option, index) => <OptionButton key={option} label={option} index={index} lang="de" selected={given === option} disabled={!!verdict}
        state={!verdict ? 'idle' : option === item.answer ? 'right' : option === given ? 'wrong' : 'idle'} onClick={() => setAnswer({ kind: 'option', value: option })} />)}</div>
      : <TextAnswer value={given} onChange={(value) => setAnswer({ kind: 'text', value })} onEnter={() => submit()} disabled={!!verdict} lang="de" placeholder="Type the missing word" label="Missing word" />}
  </div>;
}
