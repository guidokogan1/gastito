import { describe, expect, it } from "vitest";

import { formatArs, formatMoneyInput, normalizeMoneyString } from "@/lib/format";

describe("format helpers", () => {
  it("formats ARS values without awkward currency spacing", () => {
    expect(formatArs(100)).toBe("$100");
  });

  it("keeps negative ARS values compact", () => {
    expect(formatArs(-100)).toBe("-$100");
  });

  it("keeps ARS cents when present", () => {
    expect(formatArs(20000.12)).toBe("$20.000,12");
  });

  it("formats money input with Argentine separators", () => {
    expect(formatMoneyInput("20000")).toBe("$20.000");
    expect(formatMoneyInput("121212")).toBe("$121.212");
    expect(formatMoneyInput("20000,12")).toBe("$20.000,12");
    expect(formatMoneyInput("$20.000,12")).toBe("$20.000,12");
  });

  it("normalizes formatted money strings for persistence", () => {
    expect(normalizeMoneyString("$20.000,12")).toBe("20000.12");
    expect(normalizeMoneyString("$121.212")).toBe("121212");
  });
});
