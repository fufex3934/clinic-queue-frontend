"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SortOption = { value: string; label: string };

type ListDataToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  sortBy: string;
  sortOptions: SortOption[];
  onSortByChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  showSearch?: boolean;
  children?: React.ReactNode;
};

export function ListDataToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  sortBy,
  sortOptions,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  page,
  totalPages,
  total,
  onPageChange,
  limit,
  onLimitChange,
  limitOptions = [10, 20, 50],
  showSearch = true,
  children,
}: ListDataToolbarProps) {
  const from = total === 0 ? 0 : (page - 1) * (limit ?? 20) + 1;
  const to = Math.min(page * (limit ?? 20), total);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        {showSearch && (
          <div className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
              aria-label="Search list"
            />
          </div>
        )}
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="list-sort-by" className="text-xs text-muted-foreground">
              Sort by
            </Label>
            <select
              id="list-sort-by"
              className="flex h-9 min-w-[8.5rem] rounded-md border border-input bg-transparent px-2 text-sm"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="list-sort-order" className="text-xs text-muted-foreground">
              Order
            </Label>
            <select
              id="list-sort-order"
              className="flex h-9 min-w-[6.5rem] rounded-md border border-input bg-transparent px-2 text-sm"
              value={sortOrder}
              onChange={(e) =>
                onSortOrderChange(e.target.value as "asc" | "desc")
              }
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          {onLimitChange && limit != null && (
            <div className="space-y-1">
              <Label htmlFor="list-page-size" className="text-xs text-muted-foreground">
                Per page
              </Label>
              <select
                id="list-page-size"
                className="flex h-9 min-w-[4.5rem] rounded-md border border-input bg-transparent px-2 text-sm"
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
              >
                {limitOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {children}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {total === 0
            ? "No results"
            : `Showing ${from}–${to} of ${total}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
            aria-label="First page"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[5rem] text-center text-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(totalPages)}
            aria-label="Last page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
