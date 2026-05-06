import { describe, expect, it } from "vitest";

import { formatArs } from "@/lib/format";

describe("format helpers", () => {
  it("formats ARS values without awkward currency spacing", () => {
    expect(formatArs(100)).toBe("$100");
  });

  it("keeps negative ARS values compact", () => {
    expect(formatArs(-100)).toBe("-$100");
  });
});
