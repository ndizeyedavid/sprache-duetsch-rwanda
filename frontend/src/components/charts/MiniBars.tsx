type MiniBarsProps = {
  bars: number[];
  className?: string;
};

const TONES = ['bg-brand', 'bg-sun'];

/** Decorative bar cluster on the admin "Total Students" tile. */
export function MiniBars({ bars, className = '' }: MiniBarsProps) {
  const max = Math.max(...bars, 1);

  return (
    <div className={`flex h-12 items-end gap-1.5 ${className}`} aria-hidden>
      {bars.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className={`w-2.5 rounded-full ${TONES[index % TONES.length]}`}
          style={{ height: `${Math.round((value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
