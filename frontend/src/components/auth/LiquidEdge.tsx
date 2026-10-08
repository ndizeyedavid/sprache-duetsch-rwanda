/**
 * Curved seam between the photo and the form panel. Two layers (soft + solid)
 * give the edge a liquid depth. Vertical on desktop, horizontal on phones.
 */
export function LiquidEdge() {
  return (
    <>
      <svg aria-hidden viewBox="0 0 160 1000" preserveAspectRatio="none"
        className="pointer-events-none absolute right-full top-0 hidden h-full w-[160px] fill-base-100 lg:block">
        <path className="opacity-40" d="M160 0H40C24 70 26 130 34 170C44 250 104 320 100 440C96 580 16 650 20 790C24 890 56 950 50 1000H160Z" />
        <path d="M160 0H86C70 60 74 120 80 160C88 230 136 300 132 420C128 560 58 640 62 780C66 880 100 940 94 1000H160Z" />
      </svg>
      <svg aria-hidden viewBox="0 0 1000 100" preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-full left-0 h-12 w-full fill-base-100 lg:hidden">
        <path className="opacity-40" d="M0 100V20C180 0 360 70 520 40C680 10 820 0 1000 30V100Z" />
        <path d="M0 100V40C200 0 380 90 500 60C640 25 800 10 1000 55V100Z" />
      </svg>
    </>
  );
}
