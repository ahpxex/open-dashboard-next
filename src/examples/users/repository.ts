import { createMockRepository } from "@/examples/_utils/create-mock-repository";
import type { ResourceHandlers } from "@/infra/data";
import { generateUsers } from "./mock-data";
import type { User } from "./types";

export const usersHandlers: ResourceHandlers<User> = createMockRepository<User>(
  {
    storageKey: "example-users",
    seedData: () => generateUsers(100),
    searchFields: ["name", "email", "role", "department"],
    getId: (user) => String(user.id),
    generateId: () => String(Date.now()),
  },
);
