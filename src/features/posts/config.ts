import type { FilterConfig } from "@/infra/table";

export const postsFilters: FilterConfig[] = [
  {
    key: "userId",
    label: "Filter by author",
    placeholder: "All authors",
    options: [
      { key: "", label: "All authors" },
      ...Array.from({ length: 10 }, (_, i) => ({
        key: String(i + 1),
        label: `User ${i + 1}`,
      })),
    ],
  },
];

export const postsTableConfig = {
  searchPlaceholder: "Search posts…",
  pageSizeOptions: [10, 20, 50],
  defaultPageSize: 10,
  emptyMessage: "No posts found.",
};
