import { describe, expect, it } from "vitest";

import { debtSchema, recurringBillSchema, transactionSchema } from "@/lib/validators";

describe("financial validators", () => {
  it("normalizes comma money values into decimal strings", () => {
    const parsed = transactionSchema.parse({
      date: "2026-04-18",
      amount: "1200,50",
      type: "expense",
    });

    expect(parsed.amount).toBe("1200.50");
  });

  it("accepts formatted ARS money values", () => {
    const parsed = transactionSchema.parse({
      date: "2026-04-18",
      amount: "$20.000,12",
      type: "expense",
    });

    expect(parsed.amount).toBe("20000.12");
  });

  it("rejects impossible debt balances", () => {
    const parsed = debtSchema.safeParse({
      entityName: "Banco",
      direction: "we_owe",
      originalAmount: "1000",
      remainingBalance: "1200",
      isActive: true,
    });

    expect(parsed.success).toBe(false);
  });

  it("keeps recurring bill due days inside calendar bounds", () => {
    expect(
      recurringBillSchema.safeParse({
        name: "Internet",
        amount: "1000",
        dueDay: "32",
      }).success,
    ).toBe(false);
  });
});
