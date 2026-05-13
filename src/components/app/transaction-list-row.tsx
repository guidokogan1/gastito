import {
  ArrowUpRight,
  BadgePercent,
  Banknote,
  Car,
  Dumbbell,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  PawPrint,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  Utensils,
  Wifi,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

import { FinancialAmount } from "@/components/app/financial-amount";
import { cn } from "@/lib/utils";
import type { MoneyLike } from "@/lib/format";

export type TransactionPresentationType = "expense" | "income";

export function normalizeCategoryLabel(name?: string | null) {
  return (name ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function getTransactionCategoryIcon(name?: string | null, type: TransactionPresentationType = "expense"): LucideIcon {
  const normalized = normalizeCategoryLabel(name);
  if (normalized.includes("sueldo")) return Banknote;
  if (normalized.includes("devolucion")) return RotateCcw;
  if (normalized.includes("descuento")) return BadgePercent;
  if (type === "income") return ArrowUpRight;
  if (normalized.includes("comida") || normalized.includes("super")) return Utensils;
  if (normalized.includes("educ")) return GraduationCap;
  if (normalized.includes("hogar")) return Home;
  if (normalized.includes("impuesto")) return ReceiptText;
  if (normalized.includes("masc")) return PawPrint;
  if (normalized.includes("ocio")) return Gamepad2;
  if (normalized.includes("regalo")) return Gift;
  if (normalized.includes("salud")) return HeartPulse;
  if (normalized.includes("servicio") || normalized.includes("internet")) return Wifi;
  if (normalized.includes("transporte") || normalized.includes("auto")) return Car;
  if (normalized.includes("deporte")) return Dumbbell;
  if (normalized.includes("otros")) return Sparkles;
  return ShoppingCart;
}

export function getTransactionCategoryTone(name?: string | null, type: TransactionPresentationType = "expense") {
  const normalized = normalizeCategoryLabel(name);
  if (type === "income") return "bg-emerald-600 text-white";
  if (normalized.includes("comida") || normalized.includes("super")) return "bg-orange-500 text-white";
  if (normalized.includes("educ")) return "bg-violet-600 text-white";
  if (normalized.includes("hogar") || normalized.includes("servicio") || normalized.includes("internet")) return "bg-teal-600 text-white";
  if (normalized.includes("auto") || normalized.includes("transporte")) return "bg-blue-600 text-white";
  if (normalized.includes("masc")) return "bg-fuchsia-600 text-white";
  if (normalized.includes("ocio")) return "bg-amber-600 text-white";
  if (normalized.includes("regalo")) return "bg-pink-600 text-white";
  if (normalized.includes("salud")) return "bg-red-600 text-white";
  if (normalized.includes("impuesto")) return "bg-slate-700 text-white";
  if (normalized.includes("deporte")) return "bg-lime-700 text-white";
  return "bg-zinc-700 text-white";
}

export function TransactionListRow({
  title,
  categoryName,
  metaPrefix,
  amount,
  type,
  active,
  className,
  interactive = false,
}: {
  title: React.ReactNode;
  categoryName?: string | null;
  metaPrefix?: React.ReactNode;
  amount: MoneyLike;
  type: TransactionPresentationType;
  active?: boolean;
  className?: string;
  interactive?: boolean;
}) {
  const Icon = getTransactionCategoryIcon(categoryName, type);
  const categoryLabel = categoryName ?? (type === "income" ? "Ingreso" : "Sin categoría");
  const meta = metaPrefix ? (
    <>
      {metaPrefix} · {categoryLabel}
    </>
  ) : (
    categoryLabel
  );

  return (
    <div className={cn("app-list-row", active && "bg-[var(--surface-selected)]/55", className)} data-interactive={interactive ? "true" : undefined}>
      <div className={cn("app-icon-tile", getTransactionCategoryTone(categoryName, type))}>
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="app-row-title truncate">{title}</p>
        <p className="app-row-meta mt-0.5 truncate">{meta}</p>
      </div>
      <p className={cn("app-row-value", type === "income" ? "text-[var(--income)] dark:text-[var(--income-soft)]" : "text-foreground")}>
        <FinancialAmount value={amount} direction={type === "income" ? "income" : "expense"} showSign />
      </p>
    </div>
  );
}
