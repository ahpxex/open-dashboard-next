import { faker } from "@faker-js/faker";
import { createMockRepository } from "@/examples/_utils/create-mock-repository";
import type { ResourceHandlers } from "@/infra/data";
import { generateSelectableProducts } from "./mock-data";
import type { SelectableProduct } from "./types";

export const selectablesHandlers: ResourceHandlers<SelectableProduct> =
  createMockRepository<SelectableProduct>({
    storageKey: "example-selectables",
    seedData: () => generateSelectableProducts(50),
    searchFields: ["name", "sku", "supplier"],
    getId: (product) => product.id,
    generateId: () => faker.string.uuid(),
  });
