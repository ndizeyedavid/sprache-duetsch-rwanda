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
 style={{ width: size, height: size }}
 />
 {withWordmark ? (
 <span className={`text-sm font-semibold tracking-tight ${wordmarkClassName}`}>
 Deutsch Sprache RW
 </span>
 ) : null}
 </span>
 );
}
