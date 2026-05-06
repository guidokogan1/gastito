"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

export function FloatingPrimaryAction() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/movimientos") return null;

  return (
    <Link href="/movimientos?compose=1" className="floating-primary-action" aria-label="Nuevo movimiento">
      <Plus className="size-6" aria-hidden />
    </Link>
  );
}
