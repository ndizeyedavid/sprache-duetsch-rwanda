import { Link } from 'react-router-dom';

/** School badge sitting on the liquid seam, joining photo and form like a seal. */
export function AuthSeal() {
  return (
    <Link to="/" aria-label="Deutsch Sprache RW home"
      className="absolute left-1/2 -top-[3.9375rem] z-10 -translate-x-1/2 rounded-full bg-base-100 p-1.5 transition-transform duration-500 hover:scale-105 lg:-left-34 lg:top-[calc(16%-3.5rem)] lg:translate-x-0 lg:p-2">
      <img src="/logo.png" alt="" width={96} height={96} className="size-19 rounded-full object-contain lg:size-24" />
    </Link>
  );
}
