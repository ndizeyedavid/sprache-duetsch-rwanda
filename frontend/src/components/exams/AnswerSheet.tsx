import { FiCheck,FiX } from 'react-icons/fi';
import type { SheetMark,SheetPart } from '../../lib/services/exam-centre';

type Props = {
  parts: SheetPart[];
  responses: (string | null)[][];
  onChange: (part: number, item: number, value: string) => void;
  mark: SheetMark | null;
};

function choiceStyle(chosen: boolean, right: boolean, marked: boolean) {
  if (marked && right) return 'border-ok bg-ok-soft text-ok';
  if (marked && chosen) return 'border-bad bg-bad-soft text-bad line-through';
  return chosen ? 'border-primary bg-primary text-primary-content' : 'border-base-300 bg-base-100 hover:border-primary';
}

/**
 * The official answer sheet on screen: one row per item with the part's choices (a b c, Richtig/Falsch,
 * a–i, Ja/Nein). Once checked, right answers turn green and wrong picks red, item by item.
 */
export function AnswerSheet({ parts, responses, onChange, mark }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {parts.map((part, at) => {
        const result = mark?.parts[at];
        return (
          <fieldset key={`${at}-${part.title}`} className="card border border-base-300 bg-base-100 p-4" disabled={!!mark}>
            <legend className="sr-only">{part.title}</legend>
            <p className="flex items-baseline justify-between gap-2">
              <span className="font-bold" lang="de">{part.title}</span>
              {result ? <span className={`text-sm font-semibold ${result.score / result.total >= 0.6 ? 'text-ok' : 'text-bad'}`}>{result.score}/{result.total}</span> : null}
            </p>
            <ol className="mt-3 space-y-2">
              {Array.from({ length: part.count }, (_, item) => {
                const number = part.first + item;
                const chosen = responses[at]?.[item] ?? null;
                const marked = result?.items[item];
                return (
                  <li key={number} className="flex items-center gap-3">
                    <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums">{number}</span>
                    <span className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`${part.title}, item ${number}`}>
                      {part.options.map((option) => (
                        <button key={option} type="button" role="radio" aria-checked={chosen === option} onClick={() => onChange(at, item, option)}
                          className={`min-h-9 min-w-9 rounded-full border px-2.5 text-sm font-semibold ${choiceStyle(chosen === option, !!marked && marked.answer === option, !!marked)}`}>
                          {option}
                        </button>
                      ))}
                    </span>
                    {marked ? marked.correct ? <FiCheck aria-label="Right" className="text-ok" /> : <FiX aria-label={`Wrong, the answer is ${marked.answer}`} className="text-bad" /> : null}
                  </li>
                );
              })}
            </ol>
          </fieldset>
        );
      })}
    </div>
  );
}
