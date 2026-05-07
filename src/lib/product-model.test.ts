import { describe, expect, it } from "vitest";

import {
  calculateDebtRemaining,
  debtPaymentTransactionType,
  isDebtSettled,
  shouldCreateRecurringBillTransaction,
} from "@/lib/product-model";

describe("Claude product model helpers", () => {
  it("calculates debt remaining from the payment timeline", () => {
    expect(calculateDebtRemaining(100000, [30000, 20000])).toBe(50000);
    expect(calculateDebtRemaining(100000, [120000])).toBe(0);
  });

  it("marks a debt as settled when payments cover the total", () => {
    expect(isDebtSettled(45000, [20000, 25000])).toBe(true);
    expect(isDebtSettled(45000, [20000])).toBe(false);
  });

  it("maps debt payments to the correct linked movement direction", () => {
    expect(debtPaymentTransactionType("we_owe")).toBe("expense");
    expect(debtPaymentTransactionType("they_owe_us")).toBe("income");
  });

  it("only creates a fixed-bill movement when there is a paid date", () => {
    expect(shouldCreateRecurringBillTransaction(true, "2026-05-07")).toBe(true);
    expect(shouldCreateRecurringBillTransaction(true, null)).toBe(false);
    expect(shouldCreateRecurringBillTransaction(false, "2026-05-07")).toBe(false);
  });
});
