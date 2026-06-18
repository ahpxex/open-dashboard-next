import {
  filterSortPaginate,
  type ListParams,
  type ResourceHandlers,
} from "@/infra/data";

/**
 * Configuration for creating a mock repository
 */
export interface MockRepositoryConfig<T> {
  /** localStorage key for persistence */
  storageKey: string;
  /** Function to generate seed data */
  seedData: () => T[];
  /** Fields to search when filtering by 'q' */
  searchFields: (keyof T)[];
  /** Function to get the ID from an entity */
  getId: (item: T) => string;
  /** Function to generate a new ID */
  generateId: () => string;
}

/**
 * Creates a mock repository with localStorage persistence.
 * Perfect for demos and prototyping. Replace with real API calls in production.
 */
export function createMockRepository<T>(
  config: MockRepositoryConfig<T>,
): ResourceHandlers<T> {
  const { storageKey, seedData, searchFields, getId, generateId } = config;

  // Storage helpers
  const getAll = (): T[] => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as T[]) : [];
  };

  const saveAll = (items: T[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const ensureSeeded = (): T[] => {
    let items = getAll();
    if (items.length === 0) {
      items = seedData();
      saveAll(items);
    }
    return items;
  };

  return {
    list: async (params: ListParams) => {
      const items = ensureSeeded();
      return filterSortPaginate(items, {
        filters: params.filters,
        sorters: params.sorters,
        pagination: params.pagination,
        searchFields,
      });
    },

    getOne: async (id: string) => {
      const items = ensureSeeded();
      const item = items.find((i) => getId(i) === id);
      if (!item) {
        throw new Error(`Item with id "${id}" not found`);
      }
      return { data: item };
    },

    create: async (variables: Partial<T>) => {
      const items = ensureSeeded();
      const newItem = {
        ...variables,
        id: generateId(),
        createdAt: new Date().toISOString(),
      } as T;
      items.push(newItem);
      saveAll(items);
      return { data: newItem };
    },

    update: async (id: string, variables: Partial<T>) => {
      const items = ensureSeeded();
      const index = items.findIndex((i) => getId(i) === id);
      if (index === -1) {
        throw new Error(`Item with id "${id}" not found`);
      }
      items[index] = { ...items[index], ...variables };
      saveAll(items);
      return { data: items[index] };
    },

    deleteOne: async (id: string) => {
      const items = ensureSeeded();
      const filtered = items.filter((i) => getId(i) !== id);
      if (filtered.length === items.length) {
        throw new Error(`Item with id "${id}" not found`);
      }
      saveAll(filtered);
      return { data: { id } };
    },
  };
}
