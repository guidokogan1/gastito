import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  FileText,
  Repeat2,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import { FlashMessage } from "@/components/flash-message";
import { KineticPage } from "@/components/app/kinetic";
import { FinancialAmount } from "@/components/app/financial-amount";
import { MonthlyTrendChart } from "@/components/app/monthly-trend-chart";
import { getDashboardSnapshot } from "@/lib/dashboard";
import { requireHousehold } from "@/lib/auth";
import { formatArs } from "@/lib/format";
import { toTitleCase } from "@/lib/text";

function dashboardMonthLabel(monthKey: string, format: "long" | "short" = "long") {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat("es-AR", { month: format, year: format === "long" ? "numeric" : undefined }).format(date);
  return label.charAt(0).toLocaleUpperCase("es-AR") + label.slice(1);
}

function previousDashboardMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const previousMonth = new Date(year, month - 2, 1);
  return `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
}

function trendDeltaLabel(expenseDelta: number, previousExpenses: number, previousMonthLabel: string) {
  if (previousExpenses <= 0) return "Sin comparación previa";
  const percent = Math.abs((expenseDelta / previousExpenses) * 100).toLocaleString("es-AR", {
    maximumFractionDigits: 1,
  });
  const arrow = expenseDelta <= 0 ? "↓" : "↑";
  return `${arrow} ${percent}% vs. ${previousMonthLabel}`;
}

function daysUntilLabel(date: Date) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((dateStart - todayStart) / 86_400_000);
  if (days === 0) return "Vence hoy";
  if (days === 1) return "Vence mañana";
  if (days > 1) return `Vence en ${days} días`;
  if (days === -1) return "Venció ayer";
  return `Venció hace ${Math.abs(days)} días`;
}

function billIcon(icon: string): LucideIcon {
  const normalized = icon.toLowerCase();
  if (normalized.includes("wifi") || normalized.includes("internet")) return Wifi;
  if (normalized.includes("doc") || normalized.includes("file")) return FileText;
  return Repeat2;
}

function DashboardAction({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "expense" | "income";
}) {
  const Icon = tone === "income" ? ArrowDownLeft : ArrowUpRight;
  return (
    <Link
      href={href}
      className="pressable flex min-h-[4.15rem] items-center justify-center gap-2.5 rounded-[1.15rem] bg-[var(--surface-pill)] px-3.5 text-[1.05rem] font-semibold"
    >
      <span className="grid size-8 place-items-center rounded-full bg-background">
        <Icon className={tone === "income" ? "size-4 text-[var(--income)]" : "size-4 text-red-700"} aria-hidden />
      </span>
      {label}
    </Link>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; month?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const snapshot = await getDashboardSnapshot(household.id, params.month);
  const displayHouseholdName = toTitleCase(household.name);
  const previousMonthLabel = dashboardMonthLabel(previousDashboardMonthKey(snapshot.monthKey), "short");
  const trendTone = snapshot.previousExpenses <= 0 ? "neutral" : snapshot.expenseDelta <= 0 ? "positive" : "warning";
  const expenseHref = `/movimientos?month=${snapshot.monthKey}&compose=1&type=expense`;
  const incomeHref = `/movimientos?month=${snapshot.monthKey}&compose=1&type=income`;

  return (
    <KineticPage className="space-y-7 pb-8">
      <header className="pt-1 text-[1.02rem] font-semibold leading-tight text-muted-foreground">
        <p>Hola, {displayHouseholdName}</p>
        <p className="mt-1">{dashboardMonthLabel(snapshot.monthKey)}</p>
      </header>

      <FlashMessage message={params.message} tone="success" />
      {snapshot.degraded ? (
        <FlashMessage
          tone="warning"
          message="No pudimos conectar a la base de datos en este momento. Mostramos un resumen vacío para que puedas seguir navegando."
        />
      ) : null}

      <section className="space-y-6">
        <div>
          <p className="section-eyebrow">Balance del mes</p>
          <p className="money-hero mt-3">
            <FinancialAmount value={snapshot.savings} direction={snapshot.savings >= 0 ? "income" : "expense"} />
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="min-w-0">
            <p className="text-[0.95rem] font-semibold text-muted-foreground">Ingresos</p>
            <p className="mt-1 text-[1.75rem] font-semibold leading-none tracking-[-0.025em] tabular-nums">
              <FinancialAmount value={snapshot.incomes} direction="income" showSign />
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[0.95rem] font-semibold text-muted-foreground">Gastos</p>
            <p className="mt-1 text-[1.75rem] font-semibold leading-none tracking-[-0.025em] tabular-nums">
              <FinancialAmount value={snapshot.expenses} direction="expense" showSign />
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <DashboardAction href={expenseHref} label="Gasto" tone="expense" />
          <DashboardAction href={incomeHref} label="Ingreso" tone="income" />
        </div>
      </section>

      <MonthlyTrendChart
        months={snapshot.trendMonths}
        deltaLabel={trendDeltaLabel(snapshot.expenseDelta, snapshot.previousExpenses, previousMonthLabel)}
        trendTone={trendTone}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="section-eyebrow">Próximos vencimientos</h2>
          <Link href="/gastos-fijos" className="text-[1.05rem] font-semibold text-[var(--finance-green)]">
            Ver todo
          </Link>
        </div>

        {snapshot.upcomingBills.length === 0 ? (
          <div className="app-list-row">
            <div className="app-icon-tile rounded-[0.85rem]">
              <Repeat2 className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="row-title truncate">Sin vencimientos próximos</p>
              <p className="row-meta mt-0.5 truncate">Cuando registres facturas pendientes van a aparecer acá.</p>
            </div>
          </div>
        ) : (
          <div>
            {snapshot.upcomingBills.map((bill) => {
              const Icon = billIcon(bill.icon);
              return (
                <Link key={bill.id} href={`/gastos-fijos/${bill.recurringBillId}`} className="app-list-row">
                  <div className="app-icon-tile rounded-[0.85rem] text-amber-700">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="row-title truncate">{bill.name}</p>
                    <p className="row-meta mt-0.5 truncate">{daysUntilLabel(bill.dueDate)}</p>
                  </div>
                  <p className="money-row shrink-0 text-right">{formatArs(bill.amount)}</p>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </KineticPage>
  );
}
