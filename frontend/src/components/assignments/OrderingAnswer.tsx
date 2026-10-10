import { FiArrowDown,FiArrowUp } from 'react-icons/fi';
import { useShuffledOptions } from '../../hooks/useShuffledOptions';
export function OrderingAnswer({ options, value, onChange, disabled, id }: { options: string[]; value: unknown; onChange: (value: string[]) => void; disabled: boolean; id: string }) {
  const shuffled = useShuffledOptions(options, id);
  const order = Array.isArray(value) ? value.map(String) : shuffled.map(o => o.value);
  function move(index: number, offset: number) { const next = [...order]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; onChange(next); }
  return <div><p className="mb-3 text-xs text-muted">Move the items into the correct order, then confirm your order.</p><ol className="space-y-2">{order.map((v, i) => <li key={`${i}-${v}`} className="flex items-center gap-3 rounded-field border border-base-300 p-3 text-sm"><span className="text-xs text-muted">{i + 1}</span><span className="flex-1">{v}</span><button type="button" className="btn btn-ghost btn-xs" aria-label={`Move item ${i + 1} up`} disabled={disabled || i === 0} onClick={() => move(i, -1)}><FiArrowUp /></button><button type="button" className="btn btn-ghost btn-xs" aria-label={`Move item ${i + 1} down`} disabled={disabled || i === order.length - 1} onClick={() => move(i, 1)}><FiArrowDown /></button></li>)}</ol><button type="button" className="btn btn-sm mt-3" disabled={disabled} onClick={() => onChange(order)}>Confirm this order</button></div>;
}
