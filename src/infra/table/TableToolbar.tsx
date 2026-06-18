"use client";

import { ArrowClockwise, MagnifyingGlass, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { FilterConfig } from "./types";

export interface TableToolbarProps {
  enableSearch?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function TableToolbar({
  enableSearch = true,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  filterValues = {},
  onFilterChange,
  onRefresh,
  isLoading = false,
  className = "",
}: TableToolbarProps) {
  const hasControls =
    enableSearch || filters.length > 0 || typeof onRefresh === "function";

  if (!hasControls) {
    return null;
  }

  return (
    <div
      className={`mb-4 flex shrink-0 items-center gap-4 overflow-hidden ${className}`}
    >
      {enableSearch ? (
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-8 pr-8"
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      ) : null}

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={filterValues[filter.key] ?? ""}
          onValueChange={(value) => onFilterChange?.(filter.key, value ?? "")}
        >
          <SelectTrigger className="w-48" aria-label={filter.label}>
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {onRefresh ? (
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh"
        >
          {isLoading ? <Spinner /> : <ArrowClockwise size={18} />}
        </Button>
      ) : null}
    </div>
  );
}
