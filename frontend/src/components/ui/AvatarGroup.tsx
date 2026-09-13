type AvatarGroupProps = {
  items: { src: string; alt: string }[];
  extra?: number;
  size?: 'sm' | 'md';
  className?: string;
};

export function AvatarGroup({ items, extra, size = 'sm', className = '' }: AvatarGroupProps) {
  const dimensions = size === 'sm' ? 'size-8' : 'size-10';

  return (
    <div className={`avatar-group -space-x-3 rtl:space-x-reverse ${className}`}>
      {items.map((item) => (
        <div key={item.alt} className={`avatar border-2 border-base-100 ${dimensions}`}>
          <img src={item.src} alt={item.alt} loading="lazy" />
        </div>
      ))}
      {extra ? (
        <div className={`avatar placeholder border-2 border-base-100 ${dimensions}`}>
          <div className="w-full bg-brand text-[11px] font-semibold text-white">
            <span>+{extra}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
