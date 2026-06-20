import { describe, expect, it } from "vitest";
import { demoCompanies } from "./companies/demo-data";
import { companyInputSchema } from "./companies/schema";
import { demoContacts } from "./contacts/demo-data";
import { contactInputSchema } from "./contacts/schema";
import { demoCustomers } from "./customers/demo-data";
import { customerInputSchema } from "./customers/schema";
import { demoDeals } from "./deals/demo-data";
import { dealInputSchema } from "./deals/schema";
import { demoRefunds } from "./refunds/demo-data";
import { refundInputSchema } from "./refunds/schema";

const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt"];

function omit(row: Record<string, unknown>, keys: string[]) {
  const copy: Record<string, unknown> = { ...row };
  for (const key of keys) delete copy[key];
  return copy;
}

type Resource = {
  name: string;
  rows: Array<Record<string, unknown>>;
  schema?: { parse: (value: unknown) => unknown };
  omitKeys?: string[];
};

const RESOURCES: Resource[] = [
  { name: "customers", rows: demoCustomers, schema: customerInputSchema },
  { name: "refunds", rows: demoRefunds, schema: refundInputSchema },
  { name: "deals", rows: demoDeals, schema: dealInputSchema },
  { name: "contacts", rows: demoContacts, schema: contactInputSchema },
  { name: "companies", rows: demoCompanies, schema: companyInputSchema },
];

describe("business-case demo data", () => {
  for (const resource of RESOURCES) {
    describe(resource.name, () => {
      it("is non-empty", () => {
        expect(resource.rows.length).toBeGreaterThan(0);
      });

      it("has unique ids", () => {
        const ids = resource.rows.map((row) => row.id as string);
        expect(new Set(ids).size).toBe(ids.length);
      });

      const schema = resource.schema;
      if (schema) {
        it("every row satisfies its input schema", () => {
          const omitKeys = resource.omitKeys ?? SYSTEM_FIELDS;
          for (const row of resource.rows) {
            expect(() => schema.parse(omit(row, omitKeys))).not.toThrow();
          }
        });
      }
    });
  }
});
