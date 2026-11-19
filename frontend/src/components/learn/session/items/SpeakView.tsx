import { useState } from 'react';
import { FiMic,FiSquare } from 'react-icons/fi';
import { SayButton } from '../../audio/SayButton';
import { GermanText } from '../../translate/GermanText';
import type { SpeakItem } from '../../types';
import { canRecognizeSpeech,listenOnce } from '../speech';
import type { ItemViewProps } from './types';

/** Say the sentence: speech recognition checks it; without it the student confirms they said it. */
export function SpeakView({ item, verdict, submit }: ItemViewProps<SpeakItem>) {
  const [listening, setListening] = useState<{ stop: () => void } | null>(null);
  const [problem, setProblem] = useState('');
  const supported = canRecognizeSpeech();
  async function record() {
    setProblem('');
    const session = listenOnce();
    setListening(session);
    try {
      const heard = await session.result;
      if (!heard.length) { setProblem('We did not hear anything. Tap the microphone and speak clearly.'); return; }
      submit({ kind: 'speech', value: heard[0] });
    } catch (error) {
      setProblem(error instanceof Error && error.message === 'not-allowed' ? 'Allow the microphone in your browser to practise speaking.' : 'Speech recognition stopped. Try again, or tap “I said it”.');
    } finally { setListening(null); }
  }
  return <div className="space-y-5">
    <p className="text-sm font-semibold text-muted">Say this sentence</p>
    <div className="flex items-start gap-3">
      <SayButton text={item.text} audio={item.audio} slow size="md" />
      <p className="text-xl font-bold leading-snug"><GermanText text={item.text} /><span className="mt-1 block text-sm font-normal text-muted">{item.en}</span></p>
    </div>
    {!verdict ? <div className="flex flex-col items-center gap-3 py-2">
      {supported ? <button type="button" onClick={() => (listening ? listening.stop() : void record())} aria-label={listening ? 'Stop listening' : 'Speak now'}
        className={`btn btn-circle size-20 border-0 text-3xl ${listening ? 'animate-pulse bg-error text-error-content' : 'bg-primary text-primary-content'}`}>
        {listening ? <FiSquare aria-hidden /> : <FiMic aria-hidden />}
      </button> : null}
      <p className="text-center text-xs text-muted">{listening ? 'Listening… speak now.' : supported ? 'Tap the microphone and read the sentence aloud.' : 'Read the sentence aloud, then confirm.'}</p>
      {problem ? <p role="alert" className="text-center text-xs font-semibold text-error">{problem}</p> : null}
      <button type="button" className="btn btn-sm rounded-full border-line bg-base-100" onClick={() => submit({ kind: 'said' })}>I said it</button>
    </div> : null}
  </div>;
}
