import { describe, expect, it } from "vitest";
import { companyInputSchema } from "./companies/schema";
import { employeeInputSchema, onboardingSchema } from "./employees/schema";
import { leaveInputSchema } from "./leave-requests/schema";
import {
  redemptionCodeInputSchema,
  redemptionCodeUpdateSchema,
} from "./redemption-codes/schema";
import { scoreInputSchema } from "./scores/schema";
import { ticketUpdateSchema } from "./tickets/schema";
import { userInputSchema } from "./users/schema";

describe("user schema", () => {
  it("rejects an invalid email", () => {
    const result = userInputSchema.safeParse({
      name: "A",
      email: "not-an-email",
      role: "member",
      status: "active",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid user", () => {
    const result = userInputSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      role: "admin",
      status: "active",
    });
    expect(result.success).toBe(true);
  });
});

describe("redemption code schema", () => {
  it("coerces numeric strings on the wire", () => {
    const result = redemptionCodeInputSchema.safeParse({
      code: "SAVE20",
      discountPercent: "20",
      maxUses: "100",
      status: "active",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discountPercent).toBe(20);
      expect(result.data.maxUses).toBe(100);
    }
  });

  it("rejects a discount over 100", () => {
    const result = redemptionCodeInputSchema.safeParse({
      code: "TOObig",
      discountPercent: 150,
      maxUses: 1,
      status: "active",
    });
    expect(result.success).toBe(false);
  });

  it("allows a partial update (id + one field)", () => {
    const result = redemptionCodeUpdateSchema.safeParse({
      id: "code_1",
      status: "paused",
    });
    expect(result.success).toBe(true);
  });

  it("requires an id on update", () => {
    const result = redemptionCodeUpdateSchema.safeParse({ status: "paused" });
    expect(result.success).toBe(false);
  });
});

describe("ticket update schema", () => {
  it("accepts a status-only drag update", () => {
    const result = ticketUpdateSchema.safeParse({
      id: "tkt_1",
      status: "resolved",
    });
    expect(result.success).toBe(true);
  });
});

describe("employee + onboarding schema", () => {
  it("employee allows an empty managerId (top of the org)", () => {
    const result = employeeInputSchema.safeParse({
      name: "Dana",
      email: "dana@taoracle.io",
      title: "CEO",
      department: "operations",
      managerId: "",
      status: "active",
    });
    expect(result.success).toBe(true);
  });

  it("onboarding requires a manager to be chosen", () => {
    const base = {
      name: "New Hire",
      email: "new@taoracle.io",
      title: "Engineer",
      department: "engineering",
      status: "active",
    };
    expect(onboardingSchema.safeParse({ ...base, managerId: "" }).success).toBe(
      false,
    );
    expect(
      onboardingSchema.safeParse({ ...base, managerId: "emp_2" }).success,
    ).toBe(true);
  });
});

describe("leave schema", () => {
  it("rejects a malformed date", () => {
    const result = leaveInputSchema.safeParse({
      employee: "Ada",
      type: "vacation",
      date: "June 5",
      status: "pending",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an ISO date", () => {
    const result = leaveInputSchema.safeParse({
      employee: "Ada",
      type: "vacation",
      date: "2026-06-05",
      status: "pending",
    });
    expect(result.success).toBe(true);
  });
});

describe("score schema", () => {
  it("coerces wpm and rejects accuracy over 100", () => {
    expect(
      scoreInputSchema.safeParse({
        student: "Mia",
        article: "Fox",
        wpm: "55",
        accuracy: 98,
        date: "2026-06-05",
      }).success,
    ).toBe(true);
    expect(
      scoreInputSchema.safeParse({
        student: "Mia",
        article: "Fox",
        wpm: 55,
        accuracy: 150,
        date: "2026-06-05",
      }).success,
    ).toBe(false);
  });
});

describe("company schema", () => {
  it("requires a staff count of at least 1", () => {
    expect(
      companyInputSchema.safeParse({
        name: "Acme",
        industry: "saas",
        size: 0,
        location: "Remote",
        website: "acme.com",
      }).success,
    ).toBe(false);
  });
});
