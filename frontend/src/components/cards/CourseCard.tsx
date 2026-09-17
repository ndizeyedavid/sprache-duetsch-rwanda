import { Link } from 'react-router-dom';
import { Rating } from '../ui/Rating';
import { rwf } from '../../lib/format';
import type { Course } from '../../types';

type CourseCardProps = {
 course: Course;
 /** `strip` is the compact horizontal card used in the "Popular This Week" row. */
 variant?: 'grid' | 'strip';
 className?: string;
};

export function CourseCard({ course, variant = 'grid', className = '' }: CourseCardProps) {
 if (variant === 'strip') {
 return (
 <Link
 to={`/courses/${course.slug}`}
 className={` flex items-center gap-3 rounded-box bg-base-100 p-3 transition- hover: ${className}`}
 >
 <img
 src={course.thumbnail}
 alt={course.title}
 loading="lazy"
 className="size-16 shrink-0 rounded-xl object-cover"
 />
 <span className="min-w-0">
 <span className="block truncate text-sm font-semibold">{course.title}</span>
 <span className="mt-0.5 block truncate text-xs text-muted">{course.teacher.name}</span>
 <span className="mt-1.5 flex items-center gap-2">
 <Rating value={course.rating} />
 <span className="text-xs font-semibold text-brand">{rwf(course.price)}</span>
 </span>
 </span>
 </Link>
 );
 }

 return (
 <article className={` flex flex-col overflow-hidden rounded-box bg-base-100 ${className}`}>
 <img
 src={course.thumbnail}
 alt={course.title}
 loading="lazy"
 className="aspect-video w-full object-cover"
 />
 <div className="flex grow flex-col p-4">
 <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{course.title}</h3>
 <p className="mt-1 text-xs text-muted">{course.teacher.name}</p>
 <div className="mt-2 flex items-center gap-2">
 <Rating value={course.rating} />
 <span className="text-xs text-muted">(1k Review)</span>
 </div>
 <div className="mt-3 flex items-center justify-between gap-2">
 <span className="text-sm font-semibold text-brand">{rwf(course.price)}</span>
 <span className="text-xs text-muted">{course.lessonsLabel}</span>
 </div>
 <Link
 to={`/courses/${course.slug}`}
 className="btn btn-sm mt-4 w-full rounded-full border-brand bg-transparent text-brand hover:border-brand hover:bg-brand hover:text-white"
 >
 View Details
 </Link>
 </div>
 </article>
 );
}
