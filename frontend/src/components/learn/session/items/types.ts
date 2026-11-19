import type { Answer,Verdict } from '../grading';

/** Props every question view receives from the session. */
export type ItemViewProps<T> = {
  item: T;
  answer: Answer | null;
  setAnswer: (answer: Answer | null) => void;
  /** Set once the answer was checked: the view locks and shows right/wrong. */
  verdict: Verdict | null;
  /** Submit directly (Enter in a text field, self-checking questions). */
  submit: (answer?: Answer) => void;
};
