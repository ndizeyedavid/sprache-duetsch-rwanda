import { FiPlay } from 'react-icons/fi';

type VideoPlayerProps = {
  poster: string;
  alt: string;
  label?: string;
  className?: string;
  aspect?: string;
};

export function VideoPlayer({
  poster,
  alt,
  label = 'View Demo',
  className = '',
  aspect = 'aspect-video',
}: VideoPlayerProps) {
  return (
    <div className={`relative isolate overflow-hidden rounded-box bg-night ${aspect} ${className}`}>
      <img src={poster} alt={alt} loading="lazy" className="size-full object-cover" />
      <button
        type="button"
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-night/20 text-white transition-colors hover:bg-night/30"
        aria-label={label}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-base-100 text-night shadow-lg sm:size-16">
          <FiPlay className="translate-x-0.5 text-xl" aria-hidden />
        </span>
        <span className="text-sm font-semibold drop-shadow sm:text-base">{label}</span>
      </button>
    </div>
  );
}
