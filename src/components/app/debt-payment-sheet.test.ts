import { describe, expect, it } from "vitest";

import { getDebtPaymentQuickAmounts } from "@/components/app/debt-payment-sheet";

describe("debt payment quick amounts", () => {
  it("returns half and settle amounts for positive balances", () => {
    expect(getDebtPaymentQuickAmounts(50)).toEqual({
      halfAmount: 25,
      settleAmount: 50,
    });
  });

  it("never returns negative quick amounts", () => {
    expect(getDebtPaymentQuickAmounts(-10)).toEqual({
      halfAmount: 0,
      settleAmount: 0,
    });
  });
});
