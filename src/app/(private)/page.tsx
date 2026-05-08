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
import { formatArs, formatDate } from "@/lib/format";
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
      className="pressable flex min-h-[3.65rem] items-center justify-center gap-2 rounded-[1rem] bg-[var(--surface-pill)] px-4 text-[1rem] font-medium text-foreground"
    >
      <Icon className="size-4 text-muted-foreground" aria-hidden />
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
      <header className="pt-1 text-[1rem] font-normal leading-tight text-muted-foreground">
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
          <p className="text-[0.74rem] font-medium uppercase tracking-[0.075em] text-muted-foreground">Balance del mes</p>
          <p className="money-hero mt-3">
            <FinancialAmount value={snapshot.savings} direction={snapshot.savings >= 0 ? "income" : "expense"} />
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="min-w-0">
            <p className="text-[0.9rem] font-medium text-muted-foreground">Ingresos</p>
            <p className="mt-1 text-[1.5rem] font-medium leading-none tabular-nums">
              <FinancialAmount value={snapshot.incomes} direction="income" showSign />
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[0.9rem] font-medium text-muted-foreground">Gastos</p>
            <p className="mt-1 text-[1.5rem] font-medium leading-none tabular-nums">
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
          <h2 className="text-[0.74rem] font-medium uppercase tracking-[0.075em] text-muted-foreground">Próximos vencimientos</h2>
          <Link href="/gastos-fijos" className="text-[1rem] font-medium text-[var(--finance-green)]">
            Ver todo
          </Link>
        </div>

        {snapshot.upcomingBills.length === 0 ? (
          <div className="app-list-row">
            <div className="app-icon-tile rounded-[0.85rem]">
              <Repeat2 className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[1rem] font-medium text-foreground">Sin vencimientos próximos</p>
              <p className="mt-0.5 truncate text-[0.9rem] font-normal text-muted-foreground">Cuando registres facturas pendientes van a aparecer acá.</p>
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
                    <p className="truncate text-[1rem] font-medium text-foreground">{bill.name}</p>
                    <p className="mt-0.5 truncate text-[0.9rem] font-normal text-muted-foreground">{daysUntilLabel(bill.dueDate)}</p>
                  </div>
                  <p className="shrink-0 text-right text-[1.02rem] font-medium tabular-nums">{formatArs(bill.amount)}</p>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[0.74rem] font-medium uppercase tracking-[0.075em] text-muted-foreground">Últimos movimientos</h2>
          <Link href={`/movimientos?month=${snapshot.monthKey}`} className="text-[1rem] font-medium text-[var(--finance-green)]">
            Ver todo
          </Link>
        </div>

        {snapshot.recentTransactions.length === 0 ? (
          <div className="app-list-row">
            <div className="app-icon-tile rounded-[0.85rem]">
              <Repeat2 className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[1rem] font-medium text-foreground">Todavía no hay movimientos</p>
              <p className="mt-0.5 truncate text-[0.9rem] font-normal text-muted-foreground">Cargá un gasto o ingreso para ver actividad acá.</p>
            </div>
          </div>
        ) : (
          <div>
            {snapshot.recentTransactions.slice(0, 2).map((transaction) => {
              const isIncome = transaction.type === "income";
              const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
              return (
                <Link key={transaction.id} href={`/movimientos?month=${snapshot.monthKey}`} className="app-list-row">
                  <div className="app-icon-tile rounded-[0.85rem]">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[1rem] font-medium text-foreground">{transaction.detail}</p>
                    <p className="mt-0.5 truncate text-[0.9rem] font-normal text-muted-foreground">
                      {formatDate(transaction.date)} · {transaction.category?.name ?? (isIncome ? "Ingreso" : "Gasto")}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-[1.02rem] font-medium tabular-nums">
                    <FinancialAmount value={transaction.amount} direction={isIncome ? "income" : "expense"} showSign />
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </KineticPage>
  );
}
