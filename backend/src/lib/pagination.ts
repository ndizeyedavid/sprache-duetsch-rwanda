export interface Pagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

export const parsePagination = (
  query: Record<string, unknown> = {},
  options?: { defaultPageSize?: number; maxPageSize?: number },
): Pagination => {
  const defaultPageSize = options?.defaultPageSize ?? 20;
  const maxPageSize = options?.maxPageSize ?? 100;

  const page = toPositiveInt(query.page, 1);
  const pageSize = Math.min(toPositiveInt(query.pageSize, defaultPageSize), maxPageSize);

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
};

export const buildPaginated = <T>(data: T[], total: number, pagination: Pagination): Paginated<T> => {
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  return {
    data,
    meta: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };
};
