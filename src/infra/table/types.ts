// The canonical list request/response shapes live in the data layer (the
// Repository contract); re-exported here so table code has one import surface.
export type {
  ListParams,
  ListResult,
  SortDir,
} from "@/infra/data/repository";

export interface FilterOption {
  key: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  placeholder?: string;
  options: FilterOption[];
}
