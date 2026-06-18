import type { CrudFilters, CrudSorting } from "@refinedev/core";

/**
 * Parameters for list operations (pagination, filters, sorters)
 */
export interface ListParams {
  pagination?: {
    current?: number;
    pageSize?: number;
  };
  filters?: CrudFilters;
  sorters?: CrudSorting;
}

/**
 * Standard paginated response shape
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

/**
 * Resource handlers that the data provider delegates to
 */
export interface ResourceHandlers<T = any> {
  list?: (params: ListParams) => Promise<PaginatedResponse<T>>;
  getOne?: (id: string) => Promise<{ data: T }>;
  create?: (variables: Partial<T>) => Promise<{ data: T }>;
  update?: (id: string, variables: Partial<T>) => Promise<{ data: T }>;
  deleteOne?: (id: string) => Promise<{ data: { id: string } }>;
}
