import { describe, expect, it } from "vitest";
import { companyInputSchema } from "./companies/schema";
import { contactInputSchema } from "./contacts/schema";
import { dealInputSchema } from "./deals/schema";

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

  it("accepts a valid company", () => {
    expect(
      companyInputSchema.safeParse({
        name: "Acme",
        industry: "saas",
        size: 42,
        location: "Remote",
        website: "acme.com",
      }).success,
    ).toBe(true);
  });
});

describe("contact schema", () => {
  it("rejects an invalid email", () => {
    const result = contactInputSchema.safeParse({
      name: "Ada",
      email: "not-an-email",
      phone: "555-0100",
      company: "Acme",
      title: "CTO",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid contact", () => {
    const result = contactInputSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      phone: "555-0100",
      company: "Acme",
      title: "CTO",
    });
    expect(result.success).toBe(true);
  });
});

describe("deal schema", () => {
  it("coerces a numeric value on the wire", () => {
    const result = dealInputSchema.safeParse({
      name: "Acme renewal",
      company: "Acme",
      value: "5000",
      owner: "Ada",
      stage: "proposal",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(5000);
  });

  it("rejects a negative value", () => {
    const result = dealInputSchema.safeParse({
      name: "Acme renewal",
      company: "Acme",
      value: -1,
      owner: "Ada",
      stage: "proposal",
    });
    expect(result.success).toBe(false);
  });
});
