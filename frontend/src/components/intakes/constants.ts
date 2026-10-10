/** Control classes shared by the intake form, toolbar and dialogs. */
export const FIELD = 'input input w-full rounded-field border-line bg-base-200';
export const SELECT = 'select select w-full rounded-field border-line bg-base-200';

/** One dominant filled action per view. Disabled is a solid state, not an opacity fade. */
export const PRIMARY_BTN =
  'btn btn-sm gap-1 rounded-full border-0 bg-brand text-white transition-colors hover:brightness-90 disabled:border-0 disabled:bg-base-300 disabled:text-muted';
export const DANGER_BTN =
  'btn btn-sm rounded-full border-0 bg-error text-white transition-colors hover:brightness-90 disabled:border-0 disabled:bg-base-300 disabled:text-muted';
export const QUIET_BTN = 'btn btn-sm gap-1 rounded-full border-line bg-base-200 text-ink';

export const CURRENCIES = ['RWF', 'USD', 'EUR'] as const;
