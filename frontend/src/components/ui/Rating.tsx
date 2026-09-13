import { FaStar } from 'react-icons/fa6';

type RatingProps = {
  value: number;
  className?: string;
};

export function Rating({ value, className = '' }: RatingProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-muted ${className}`}>
      <FaStar className="text-sun" aria-hidden />
      {value.toFixed(1)}
    </span>
  );
}
