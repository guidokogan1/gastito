import { describe, expect, it } from "vitest";

import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, DEFAULT_PAYMENT_METHODS } from "@/lib/catalog";

describe("default catalog", () => {
  it("includes enough starter categories", () => {
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThanOrEqual(10);
    expect(DEFAULT_CATEGORIES).toContain("Supermercado");
  });

  it("includes common payment methods", () => {
    expect(DEFAULT_PAYMENT_METHODS).toContain("Transferencia");
    expect(DEFAULT_PAYMENT_METHODS).toContain("Credito");
  });

  it("provides starter accounts", () => {
    expect(DEFAULT_ACCOUNTS.map((account) => account.type)).toContain("bank");
  });
});
