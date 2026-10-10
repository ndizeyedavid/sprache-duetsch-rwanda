import type { CSSProperties } from 'react';
import type { MyProfile } from '../../lib/services';
import { TONE_FLAT } from './constants';
import { clampPercent,statTiles } from './utils';

type Props = { profile: MyProfile; overall: number | null };

/** Four headline numbers, each with the sentence that explains it. */
export function ProfileStatStrip({ profile, overall }: Props) {
  const percent = clampPercent(overall);
  const tiles = statTiles(profile);

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <section className="card flex-row items-center gap-4 border border-line bg-base-100 p-4 sm:p-5">
        <div
          className="radial-progress shrink-0 text-brand"
          style={{ '--value': percent, '--size': '3.75rem', '--thickness': '5px' } as CSSProperties}
          role="progressbar"
          aria-label="Overall course completion"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="text-[11px] font-bold text-ink">{overall === null ? '—' : `${percent}%`}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Course completion</p>
          <p className="mt-1 text-xs leading-5 text-muted">Across every enrolled level</p>
        </div>
      </section>

      {tiles.map((tile) => (
        <section key={tile.key} className="card border border-line bg-base-100 p-4 sm:p-5">
          <span className={`mb-3 grid size-9 place-items-center rounded-xl ${TONE_FLAT[tile.tone]}`}>
            <tile.icon aria-hidden size={18} />
          </span>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{tile.value}</p>
          <p className="mt-1 text-xs font-medium">{tile.label}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{tile.hint}</p>
        </section>
      ))}
    </div>
  );
}
