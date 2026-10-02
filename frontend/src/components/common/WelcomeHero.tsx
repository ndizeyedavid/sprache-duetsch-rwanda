import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

type Props = {
  firstName: string | null;
  message: string;
  action: { label: string; to: string };
};

/** Brand-red welcome banner at the top of a role dashboard. */
export function WelcomeHero({ firstName, message, action }: Props) {
  return (
    <section className="relative overflow-hidden rounded-box bg-brand text-white">
      <div className="relative z-10 flex max-w-xl flex-col justify-center p-6 sm:p-7 md:min-h-56">
        <h2 className="text-2xl font-bold leading-snug sm:text-3xl">
          Welcome back{firstName ? `, ${firstName}` : ''}!
        </h2>
        <p className="mt-2 max-w-md text-sm text-white/85">{message}</p>
        <div className="mt-5">
          <Link to={action.to} className="btn btn-sm gap-1 rounded-full bg-white text-brand hover:bg-white/90">
            {action.label} <FiArrowRight aria-hidden />
          </Link>
        </div>
      </div>
      {/* Cut-out photo cropped like a banner (faces up top, table falls off the bottom);
          the left fade blends its rough cut-out edge into the brand red. */}
      <img
        src="/student-hero.webp"
        alt=""
        aria-hidden
        width={1200}
        height={1058}
        className="pointer-events-none absolute inset-y-0 right-0 hidden aspect-[3/2] h-full w-auto object-cover object-[50%_16px] mask-l-from-60% md:block"
      />
    </section>
  );
}
