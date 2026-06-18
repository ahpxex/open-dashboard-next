import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// React Testing Library leaves mounted trees between tests; unmount them so
// each test starts from a clean DOM.
afterEach(() => {
  cleanup();
});
