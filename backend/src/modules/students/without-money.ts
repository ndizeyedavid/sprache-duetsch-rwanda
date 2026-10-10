type MoneyFields = { finance?: unknown; enrollments?: { totalFee?: unknown; discountTotal?: unknown }[] };

/**
 * Academic staff never receive money: drop the finance profile and enrolment fees.
 * Finance Admin and Super Admin get the record unchanged.
 */
export const withoutMoney = <T extends MoneyFields>(student: T, canSeeMoney: boolean) => {
  if (canSeeMoney) return student;
  const { finance: _finance, enrollments, ...rest } = student;
  if (!enrollments) return rest;
  return { ...rest, enrollments: enrollments.map(({ totalFee: _fee, discountTotal: _discount, ...row }) => row) };
};
