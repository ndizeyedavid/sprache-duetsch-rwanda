import { FiArrowDown,FiArrowUp,FiX } from 'react-icons/fi';

type Props = { label: string; index: number; count: number; min?: number; onMove: (to: number) => void; onRemove: () => void };

/** Reorder / remove controls for one row of a repeatable editor list. */
export function RowButtons({ label, index, count, min = 1, onMove, onRemove }: Props) {
  return <span className="flex shrink-0 items-center">
    <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(index - 1)}><FiArrowUp aria-hidden /></button>
    <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(index + 1)}><FiArrowDown aria-hidden /></button>
    <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={`Remove ${label}`} disabled={count <= min} onClick={onRemove}><FiX aria-hidden /></button>
  </span>;
}
