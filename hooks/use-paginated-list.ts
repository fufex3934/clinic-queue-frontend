"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { ListQueryParams, PaginatedResult, SortOrder } from "@/types/pagination";

type UsePaginatedListOptions<T> = {
  fetcher: (params: ListQueryParams) => Promise<{ data: PaginatedResult<T> }>;
  enabled?: boolean;
  defaultLimit?: number;
  defaultSortBy: string;
  defaultSortOrder?: SortOrder;
  /** Reset to page 1 when these change (e.g. clinic scope). */
  resetDeps?: unknown[];
};

export function usePaginatedList<T>({
  fetcher,
  enabled = true,
  defaultLimit = 20,
  defaultSortBy,
  defaultSortOrder = "desc",
  resetDeps = [],
}: UsePaginatedListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setItems([]);
      setTotal(0);
      setTotalPages(1);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { data } = await fetcherRef.current({
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        sortBy,
        sortOrder,
      });
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      if (data.page !== page) {
        setPage(data.page);
      }
    } catch (err: unknown) {
      setItems([]);
      setTotal(0);
      setTotalPages(1);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enabled, page, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, resetDeps);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setItems([]);
      return;
    }
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load data");
    });
  }, [load, enabled]);

  const setSearchQuery = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const setSortByField = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const setSortOrderField = (order: SortOrder) => {
    setSortOrder(order);
    setPage(1);
  };

  const setPageSize = (size: number) => {
    setLimit(size);
    setPage(1);
  };

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    search,
    sortBy,
    sortOrder,
    loading,
    error,
    setSearch: setSearchQuery,
    setSortBy: setSortByField,
    setSortOrder: setSortOrderField,
    setPage,
    setLimit: setPageSize,
    setError,
    reload: load,
  };
}
