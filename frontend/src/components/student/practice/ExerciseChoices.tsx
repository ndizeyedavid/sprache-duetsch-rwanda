import { useShuffledOptions } from '../../../hooks/useShuffledOptions';

type Props = { options: string[]; group: string; answer: string; onChange: (value: string) => void };

export function ExerciseChoices({ options, group, answer, onChange }: Props) {
  const choices = useShuffledOptions(options, group);
  return <div className="flex flex-wrap gap-2">
    {choices.map(({ value: option, index }) => <label key={index} className={`btn btn-sm flex-1 ${answer === option ? 'btn-primary' : 'btn-outline border-base-300'}`}>
      <input type="radio" name={group} className="radio radio-xs" checked={answer === option} onChange={() => onChange(option)} />
      {option === 'L' ? 'Long (L)' : option === 'S' ? 'Short (S)' : option}
    </label>)}
  </div>;
}
