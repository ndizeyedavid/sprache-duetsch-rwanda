import { FiArrowLeft,FiArrowUpRight,FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

/** A course the student joined but has not paid for yet: explain and point to payments. */
export function CoursePaymentLock({ title }: { title: string }) {
  return (
    <PageHero
      eyebrow="Payment needed"
      icon={FiLock}
      title={title}
      description="You have a place in this course. Pay the course fee to open lessons, notes and tests."
      art="finance"
      actions={<>
        <Link className={heroAction} to="/profile?view=payments">Pay for your course<FiArrowUpRight aria-hidden /></Link>
        <Link className={heroGhost} to="/courses"><FiArrowLeft aria-hidden />My courses</Link>
      </>}
    />
  );
}
