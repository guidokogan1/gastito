import { describe, expect, it } from "vitest";

import { DEFAULT_ACCOUNTS, DEFAULT_BANKS, DEFAULT_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_PAYMENT_METHODS } from "@/lib/catalog";

describe("default catalog", () => {
  it("includes enough starter categories", () => {
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThanOrEqual(10);
    expect(DEFAULT_CATEGORIES.map((category) => category.name)).toContain("Supermercado");
    expect(new Set(DEFAULT_CATEGORIES.map((category) => category.icon)).size).toBeGreaterThanOrEqual(10);
    expect(DEFAULT_CATEGORIES.every((category) => category.kind === "expense")).toBe(true);
  });

  it("includes common payment methods", () => {
    expect(DEFAULT_PAYMENT_METHODS.map((method) => method.name)).toContain("Transferencia");
    expect(DEFAULT_PAYMENT_METHODS.map((method) => method.type)).toContain("credit");
  });

  it("keeps income categories separate from expense categories", () => {
    expect(DEFAULT_INCOME_CATEGORIES.every((category) => category.kind === "income")).toBe(true);
  });

  it("provides starter banks for linked payment methods", () => {
    expect(DEFAULT_BANKS.length).toBeGreaterThanOrEqual(2);
  });

  it("provides starter accounts", () => {
    expect(DEFAULT_ACCOUNTS.map((account) => account.type)).toContain("bank");
  });
});
