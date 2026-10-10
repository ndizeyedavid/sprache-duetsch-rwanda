const CELL = 'bg-base-100 px-4 py-4';

function CoverageSkeleton() {
  return (
    <div className="learning-panel grid grid-cols-2 gap-px overflow-hidden rounded-box bg-base-300 sm:grid-cols-4">
      {[0, 1, 2, 3].map((slot) => (
        <div key={slot} className={CELL}>
          <div className="skeleton h-3 w-20" />
          <div className="skeleton mt-2 h-7 w-12" />
          <div className="skeleton mt-2.5 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

function TeacherCardSkeleton() {
  return (
    <div className="learning-panel rounded-box p-5">
      <div className="flex items-center gap-3">
        <div className="skeleton size-11 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-32" />
          <div className="skeleton h-3 w-44" />
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <div className="skeleton h-7 w-14 rounded-full" />
        <div className="skeleton h-7 w-14 rounded-full" />
        <div className="skeleton h-7 w-14 rounded-full" />
      </div>
    </div>
  );
}

/** First paint shaped like the real page — coverage strip, level cards, class rows. */
export function TeachingSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading teaching assignments…</span>
      <CoverageSkeleton />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <TeacherCardSkeleton key={slot} />
        ))}
      </div>
      <div className="learning-panel rounded-box p-5">
        {[0, 1, 2].map((slot) => (
          <div key={slot} className="flex items-center gap-4 py-3">
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-40" />
              <div className="skeleton h-3 w-56" />
            </div>
            <div className="skeleton h-8 w-40 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}