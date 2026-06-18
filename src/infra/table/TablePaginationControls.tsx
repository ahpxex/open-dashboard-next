"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TablePaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

/**
 * Build a compact page range with ellipsis markers, e.g.
 * [1, "…", 4, 5, 6, "…", 20].
 */
function buildPageRange(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) {
    pages.push("ellipsis");
  }
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  if (end < total - 1) {
    pages.push("ellipsis");
  }
  pages.push(total);

  return pages;
}

export function TablePaginationControls({
  page,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className = "",
}: TablePaginationControlsProps) {
  if (totalPages <= 0) {
    return null;
  }

  const pageRange = buildPageRange(page, totalPages);

  return (
    <div
      className={`mt-6 flex shrink-0 items-center justify-between overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Rows per page:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            if (value) {
              onPageSizeChange(Number.parseInt(value, 10));
            }
          }}
        >
          <SelectTrigger
            size="sm"
            className="w-20"
            aria-label="Select page size"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option.toString()} value={option.toString()}>
                {option.toString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text=""
              aria-disabled={page <= 1}
              className={
                page <= 1 ? "pointer-events-none opacity-50" : undefined
              }
              onClick={(event) => {
                event.preventDefault();
                if (page > 1) {
                  onPageChange(page - 1);
                }
              }}
            />
          </PaginationItem>

          {pageRange.map((item, index) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  isActive={item === page}
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(item);
                  }}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              text=""
              aria-disabled={page >= totalPages}
              className={
                page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
              onClick={(event) => {
                event.preventDefault();
                if (page < totalPages) {
                  onPageChange(page + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
