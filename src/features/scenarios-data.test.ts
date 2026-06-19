import { describe, expect, it } from "vitest";
import { demoAlerts } from "./alerts/demo-data";
import { demoArticles } from "./articles/demo-data";
import { articleInputSchema } from "./articles/schema";
import { demoClasses } from "./classes/demo-data";
import { classInputSchema } from "./classes/schema";
import { demoCompanies } from "./companies/demo-data";
import { companyInputSchema } from "./companies/schema";
import { demoContacts } from "./contacts/demo-data";
import { contactInputSchema } from "./contacts/schema";
import { demoCustomers } from "./customers/demo-data";
import { customerInputSchema } from "./customers/schema";
import { demoDeals } from "./deals/demo-data";
import { dealInputSchema } from "./deals/schema";
import { demoDevices } from "./devices/demo-data";
import { demoEmployees } from "./employees/demo-data";
import { employeeInputSchema } from "./employees/schema";
import { demoLeaveRequests } from "./leave-requests/demo-data";
import { leaveInputSchema } from "./leave-requests/schema";
import { demoRedemptionCodes } from "./redemption-codes/demo-data";
import { redemptionCodeInputSchema } from "./redemption-codes/schema";
import { demoRefunds } from "./refunds/demo-data";
import { refundInputSchema } from "./refunds/schema";
import { demoScores } from "./scores/demo-data";
import { scoreInputSchema } from "./scores/schema";
import { demoStudents } from "./students/demo-data";
import { studentInputSchema } from "./students/schema";
import { demoTasks } from "./tasks/demo-data";
import { taskInputSchema } from "./tasks/schema";
import { demoTickets } from "./tickets/demo-data";
import { ticketInputSchema } from "./tickets/schema";
import { demoUsers } from "./users/demo-data";
import { userInputSchema } from "./users/schema";

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
  { name: "users", rows: demoUsers, schema: userInputSchema },
  { name: "tasks", rows: demoTasks, schema: taskInputSchema },
  {
    name: "redemption-codes",
    rows: demoRedemptionCodes,
    schema: redemptionCodeInputSchema,
    omitKeys: [...SYSTEM_FIELDS, "usedCount"],
  },
  { name: "customers", rows: demoCustomers, schema: customerInputSchema },
  { name: "refunds", rows: demoRefunds, schema: refundInputSchema },
  { name: "tickets", rows: demoTickets, schema: ticketInputSchema },
  { name: "deals", rows: demoDeals, schema: dealInputSchema },
  { name: "contacts", rows: demoContacts, schema: contactInputSchema },
  { name: "companies", rows: demoCompanies, schema: companyInputSchema },
  { name: "employees", rows: demoEmployees, schema: employeeInputSchema },
  {
    name: "leave-requests",
    rows: demoLeaveRequests,
    schema: leaveInputSchema,
  },
  { name: "articles", rows: demoArticles, schema: articleInputSchema },
  { name: "classes", rows: demoClasses, schema: classInputSchema },
  { name: "students", rows: demoStudents, schema: studentInputSchema },
  { name: "scores", rows: demoScores, schema: scoreInputSchema },
  { name: "devices", rows: demoDevices },
  { name: "alerts", rows: demoAlerts },
];

describe("scenario demo data", () => {
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

describe("org chart integrity (employees)", () => {
  it("every managerId is empty or points to a real employee", () => {
    const ids = new Set(demoEmployees.map((employee) => employee.id));
    for (const employee of demoEmployees) {
      if (employee.managerId !== "") {
        expect(ids.has(employee.managerId)).toBe(true);
      }
    }
  });

  it("has exactly one root (top of the org)", () => {
    const roots = demoEmployees.filter((employee) => employee.managerId === "");
    expect(roots.length).toBe(1);
  });

  it("has no manager cycles", () => {
    const byId = new Map(demoEmployees.map((e) => [e.id, e]));
    for (const start of demoEmployees) {
      const seen = new Set<string>();
      let current: string | undefined = start.id;
      while (current && current !== "") {
        expect(seen.has(current)).toBe(false);
        seen.add(current);
        current = byId.get(current)?.managerId;
      }
    }
  });
});

describe("fleet (devices)", () => {
  it("is large enough to need virtualization", () => {
    expect(demoDevices.length).toBeGreaterThanOrEqual(10000);
  });
});
