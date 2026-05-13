import { describe, expect, it } from "vitest";

import { isPathActive } from "@/components/app/nav-link";

describe("isPathActive", () => {
  it("matches root only on exact root", () => {
    expect(isPathActive("/", "/")).toBe(true);
    expect(isPathActive("/gastos-fijos", "/")).toBe(false);
  });

  it("keeps parent sections active on nested detail routes", () => {
    expect(isPathActive("/gastos-fijos/bill-internet", "/gastos-fijos")).toBe(true);
    expect(isPathActive("/deudas/debt-juan", "/deudas")).toBe(true);
    expect(isPathActive("/movimientos", "/movimientos")).toBe(true);
  });

  it("does not cross-match unrelated sections", () => {
    expect(isPathActive("/deudas/debt-juan", "/gastos-fijos")).toBe(false);
    expect(isPathActive("/mas/bancos", "/movimientos")).toBe(false);
  });
});
