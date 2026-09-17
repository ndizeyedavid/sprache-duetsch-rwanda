import { FiMoreHorizontal } from 'react-icons/fi';

type KebabMenuProps = {
 label: string;
 className?: string;
};

export function KebabMenu({ label, className = '' }: KebabMenuProps) {
 return (
 <button
 type="button"
 aria-label={label}
 className={`btn btn-ghost btn-xs btn-circle text-muted ${className}`}
 >
 <FiMoreHorizontal aria-hidden />
 </button>
 );
}
