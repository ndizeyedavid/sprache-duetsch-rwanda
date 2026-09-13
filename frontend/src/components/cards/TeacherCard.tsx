import { FaStar } from 'react-icons/fa6';
import { KebabMenu } from '../ui/KebabMenu';
import type { Teacher } from '../../types';

type TeacherCardProps = {
  teacher: Teacher;
  className?: string;
};

export function TeacherCard({ teacher, className = '' }: TeacherCardProps) {
  return (
    <article className={`card-shadow relative rounded-box bg-base-100 p-4 text-center ${className}`}>
      <div className="absolute right-3 top-3">
        <KebabMenu label={`More options for ${teacher.name}`} />
      </div>
      <img
        src={teacher.photo}
        alt={teacher.name}
        loading="lazy"
        className="mx-auto size-24 rounded-full object-cover"
      />
      <h3 className="mt-3 text-sm font-semibold">{teacher.name}</h3>
      <p className="mt-1 flex items-center justify-center gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <FaStar className="text-sun" aria-hidden />
          {teacher.rating.toFixed(1)}
        </span>
        <span aria-hidden>|</span>
        <span>Review ({teacher.reviews})</span>
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {teacher.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-base-200 px-3 py-1 text-[11px] font-medium text-muted">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-field bg-base-200 px-3 py-2">
          <p className="text-[11px] text-muted">Achievement</p>
          <p className="text-sm font-semibold text-ink">{teacher.achievements}</p>
        </div>
        <div className="rounded-field bg-base-200 px-3 py-2">
          <p className="text-[11px] text-muted">Certificate</p>
          <p className="text-sm font-semibold text-ink">{teacher.certificates}</p>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-sm mt-4 w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90"
      >
        View Class
      </button>
    </article>
  );
}
