import { useEffect,useState } from 'react';
import { FiArrowDown,FiArrowUp } from 'react-icons/fi';
import { shuffleOptions } from '../../lib/shuffle-options';
import { orderingItems } from './config-readers';
import type { PlayerProps } from './types';

/** Reorder with up/down buttons (keyboard and touch friendly); the response is the current order. */
export function OrderingPlayer({ activityId, config, value, onChange, disabled }: PlayerProps) {
  const items = orderingItems(config);
  const [initial] = useState(() => {
    const shuffled = shuffleOptions(items, Math.floor(Math.random() * 4294967296), activityId).map(entry => entry.value);
    return shuffled.length > 1 && shuffled.every((item, index) => item === items[index]) ? [...shuffled.slice(1), shuffled[0]] : shuffled;
  });
  const order = Array.isArray(value) ? value.map(String) : initial;
  const ready = Array.isArray(value);
  useEffect(() => { if (!ready && initial.length) onChange(initial); }, [ready, initial, onChange]);
  function move(index: number, offset: number) {
    const next = [...order];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }
  return <div>
    <p className="text-sm font-medium">Put the items in the right order</p>
    <p className="mt-1 text-xs text-muted">Use the arrows to move an item up or down.</p>
    <ol className="mt-3 space-y-2" aria-label="Your order">
      {order.map((item, index) => <li key={`${index}-${item}`} className="flex items-center gap-2 rounded-box border border-base-300 bg-base-100 p-2 pl-3 text-sm">
        <span className="w-5 text-xs font-bold text-muted">{index + 1}</span>
        <span className="min-w-0 flex-1 break-words">{item}</span>
        <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={`Move “${item}” up`} disabled={disabled || index === 0} onClick={() => move(index, -1)}><FiArrowUp aria-hidden /></button>
        <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={`Move “${item}” down`} disabled={disabled || index === order.length - 1} onClick={() => move(index, 1)}><FiArrowDown aria-hidden /></button>
      </li>)}
    </ol>
  </div>;
}
