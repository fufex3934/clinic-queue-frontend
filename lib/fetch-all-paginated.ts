import type { PaginatedResult } from "@/types/pagination";

const PAGE_SIZE = 100;

/**
 * Loads every page from a paginated API (max 100 per request).
 */
export async function fetchAllPaginated<T>(
  fetchPage: (params: {
    page: number;
    limit: number;
  }) => Promise<{ data: PaginatedResult<T> }>,
): Promise<T[]> {
  const first = await fetchPage({ page: 1, limit: PAGE_SIZE });
  const { items, totalPages } = first.data;
  if (totalPages <= 1) {
    return items;
  }

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPage({ page: index + 2, limit: PAGE_SIZE }).then((res) => res.data.items),
    ),
  );

  return [...items, ...rest.flat()];
}
