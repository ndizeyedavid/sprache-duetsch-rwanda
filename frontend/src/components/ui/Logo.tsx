type LogoProps = {
 size?: number;
 className?: string;
 /** Hide the wordmark when only the badge should show. */
 withWordmark?: boolean;
 wordmarkClassName?: string;
};

/** Brand mark — the Deutsch Sprache RW badge from `/public/logo.png`. */
export function Logo({
 size = 40,
 className = '',
 withWordmark = false,
 wordmarkClassName = '',
}: LogoProps) {
 return (
 <span className={`inline-flex items-center gap-3 ${className}`}>
 <img
 src="/logo.png"
 alt="Deutsch Sprache RW"
 width={size}
 height={size}
 className="shrink-0 rounded-full object-contain"
 // rem, so the badge scales with the laptop root size like the wordmark beside it.
 style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}
 />
 {withWordmark ? (
 <span className={`text-sm font-semibold tracking-tight ${wordmarkClassName}`}>
 Deutsch Sprache RW
 </span>
 ) : null}
 </span>
 );
}
