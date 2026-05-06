import Link from "next/link";
import { Plus } from "lucide-react";

export function FloatingPrimaryAction() {
  return (
    <Link href="/movimientos?compose=1" className="floating-primary-action" aria-label="Nuevo movimiento">
      <Plus className="size-6" aria-hidden />
    </Link>
  );
}
