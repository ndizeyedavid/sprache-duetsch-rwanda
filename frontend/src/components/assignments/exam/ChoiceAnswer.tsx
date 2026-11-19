import { useShuffledOptions } from '../../../hooks/useShuffledOptions';

type Props = { name: string; number: number; options: string[]; value: unknown; onChange: (value: string) => void; disabled: boolean; letters?: boolean };

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
/** Two-way answers keep the order the test was written in ("Richtig" before "Falsch"). */
const BINARY = new Set(['falsch|richtig', 'ja|nein', 'false|true']);
const isBinary = (options: string[]) => options.length === 2 && BINARY.has(options.map((option) => option.toLowerCase()).sort().join('|'));

/**
 * One-answer choice. Exam parts (`letters`) keep the written order and label options a, b, c like the
 * answer sheet; options that are only letters ("a"… "i", "x" for "no ad fits") become a compact row
 * because what they stand for is listed in the part's reading text. Other tests shuffle per attempt.
 */
export function ChoiceAnswer({ name, number, options, value, onChange, disabled, letters = false }: Props) {
  const shuffled = useShuffledOptions(options, name);
  const ordered = letters || isBinary(options) ? options.map((option, index) => ({ value: option, index })) : shuffled;
  const isChecked = (option: string, index: number) => value === option || value === String(index) || value === index;

  if (letters && options.every((option) => /^[a-z]$/i.test(option))) {
    return <fieldset className="flex flex-wrap gap-2"><legend className="sr-only">Choose a letter for question {number}</legend>
      {ordered.map(({ value: option, index }) => {
        const checked = isChecked(option, index);
        return <label key={index} className={`grid size-11 cursor-pointer place-items-center rounded-full border text-sm font-bold uppercase ${checked ? 'border-primary bg-primary text-primary-content' : 'border-base-300 bg-base-100 hover:border-primary'}`}>
          <input type="radio" name={name} checked={checked} onChange={() => onChange(option)} disabled={disabled} className="sr-only" />{option}
        </label>;
      })}
    </fieldset>;
  }

  const labelled = letters && (options.length > 2 || options.some((option) => option.length > 12));
  const long = options.some((option) => option.length > 40 || option.includes('\n'));
  return <fieldset className={`grid gap-2 ${long ? '' : 'sm:grid-cols-2'}`}><legend className="sr-only">Select one answer for question {number}</legend>
    {ordered.map(({ value: option, index }) => {
      const checked = isChecked(option, index);
      return <label key={index} className={`flex cursor-pointer items-start gap-3 rounded-field border p-3 text-sm ${checked ? 'border-primary bg-primary text-primary-content' : 'border-base-300'}`}>
        <input type="radio" name={name} checked={checked} onChange={() => onChange(option)} disabled={disabled} className="radio radio-primary radio-sm mt-0.5" />
        {labelled ? <span className="font-bold">{LETTERS[index]}</span> : null}
        <span className="min-w-0 whitespace-pre-line">{option}</span>
      </label>;
    })}
  </fieldset>;
}
