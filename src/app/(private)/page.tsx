import Link from "next/link";
import { ArrowRightLeft, CheckCircle2, HandCoins, Plus, Repeat2, Sparkles, Tags } from "lucide-react";

import { GroupedSection } from "@/components/app/grouped-section";
import { FlashMessage } from "@/components/flash-message";
import { KineticPage } from "@/components/app/kinetic";
import { FinanceList, FinanceRow } from "@/components/app/finance-list";
import { ScreenScaffold } from "@/components/app/screen-scaffold";
import { EmptyState } from "@/components/app/empty-state";
import { FinancialAmount } from "@/components/app/financial-amount";
import { Button } from "@/components/ui/button";
import { MonthSelector } from "@/components/app/month-selector";
import { DashboardSignalList, type DashboardSignal } from "@/components/app/dashboard-signal-list";
import { getDashboardSnapshot } from "@/lib/dashboard";
import { requireHousehold } from "@/lib/auth";
import { formatArs, formatDate } from "@/lib/format";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; month?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const snapshot = await getDashboardSnapshot(household.id, params.month);
  const expenseTrend =
    snapshot.previousExpenses > 0
      ? `${snapshot.expenseDelta >= 0 ? "+" : ""}${Math.round((snapshot.expenseDelta / snapshot.previousExpenses) * 100)}% vs. mes anterior`
      : "Sin comparación previa";
  const trendSummary =
    snapshot.previousExpenses > 0
      ? `${Math.abs(Math.round((snapshot.expenseDelta / snapshot.previousExpenses) * 100))}% ${
          snapshot.expenseDelta <= 0 ? "menos" : "más"
        } que el mes anterior`
      : "Sin comparación previa";
  const hasTransactions = snapshot.recentTransactions.length > 0;
  const firstUpcomingBill = snapshot.upcomingBills[0] ?? null;
  const signals: DashboardSignal[] = [];

  if (snapshot.expenses > 0) {
    signals.push({
      icon: Sparkles,
      title: "Proyección de cierre",
      meta: trendSummary,
      value: formatArs(snapshot.projectedExpenses),
      tone: snapshot.expenseDelta <= 0 ? "positive" : "warning",
    });
  }

  if (firstUpcomingBill) {
    signals.push({
      icon: Repeat2,
      title: firstUpcomingBill.name,
      meta: `Vence el día ${firstUpcomingBill.dueDay} · ${firstUpcomingBill.paymentMethod?.name ?? "Sin medio"}`,
      value: formatArs(firstUpcomingBill.amount),
      tone: "warning",
    });
  }

  if (snapshot.activeDebts.length > 0) {
    signals.push({
      icon: HandCoins,
      title: "Deudas activas",
      meta: `${snapshot.activeDebts.length} saldo${snapshot.activeDebts.length === 1 ? "" : "s"} pendiente${snapshot.activeDebts.length === 1 ? "" : "s"}`,
      value: formatArs(snapshot.debtBalance),
      tone: "neutral",
    });
  }

  if (signals.length === 0) {
    signals.push({
      icon: CheckCircle2,
      title: "Sin pendientes cargados",
      meta: hasTransactions ? "No hay vencimientos ni deudas activas para mostrar." : "Cuando cargues datos, las señales importantes aparecen acá.",
      tone: "positive",
    });
  }

  const visibleSignals = signals.slice(0, 3);

  return (
    <KineticPage className="space-y-5">
      <ScreenScaffold
        title="Resumen"
        actions={
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <MonthSelector value={snapshot.monthKey} availableMonths={snapshot.availableMonths} variant="pill" />
            <Button asChild size="icon" aria-label="Cargar movimiento">
              <Link href={`/movimientos?month=${snapshot.monthKey}&compose=1`}>
                <Plus className="size-5" aria-hidden />
              </Link>
            </Button>
          </div>
        }
      >
        <FlashMessage message={params.message} tone="success" />
        {snapshot.degraded ? (
          <FlashMessage
            tone="warning"
            message="No pudimos conectar a la base de datos en este momento. Mostramos un resumen vacío para que puedas seguir navegando."
          />
        ) : null}

        <section className="space-y-4 border-b border-border/70 pb-5">
          <div className="space-y-4">
            <p className="text-[0.96rem] font-semibold text-muted-foreground">Hola, {household.name}.</p>
            <div>
              <p className="text-[1rem] font-semibold text-foreground">Gastos del mes</p>
              <p className="money-hero mt-1">{formatArs(snapshot.expenses)}</p>
            </div>
            <div className="rounded-[1.15rem] bg-[var(--surface-pill)] px-4 py-3">
              <p className="text-sm font-semibold leading-relaxed text-[var(--finance-green)]">
                {hasTransactions ? trendSummary : "Cargá tus primeros movimientos para empezar a leer el mes."}
              </p>
              {hasTransactions ? (
                <p className="mt-1 text-xs font-semibold text-muted-foreground">Actualizado {formatDate(snapshot.updatedAt)}</p>
              ) : null}
            </div>
          </div>

          <div className="finance-summary-strip border-t border-border/70 pt-3">
            <div className="finance-summary-cell">
              <p className="stat-label">Ingresos</p>
              <p className="money-row mt-1">
                <FinancialAmount value={snapshot.incomes} direction="income" />
              </p>
            </div>
            <div className="finance-summary-cell">
              <p className="stat-label">Balance</p>
              <p className="money-row mt-1">
                <FinancialAmount value={snapshot.savings} direction={snapshot.savings >= 0 ? "income" : "expense"} />
              </p>
            </div>
            <div className="finance-summary-cell">
              <p className="stat-label">Proyección</p>
              <p className="money-row mt-1">
                {formatArs(snapshot.projectedExpenses)}
              </p>
            </div>
          </div>
        </section>

        {!hasTransactions ? (
          <EmptyState
            icon={ArrowRightLeft}
            title="Todavía no hay movimientos"
            description="Cargá el primero para ver señales, actividad reciente y categorías del mes."
            compact
          >
            <Button asChild>
              <Link href={`/movimientos?month=${snapshot.monthKey}&compose=1`}>
                <Plus className="size-4" aria-hidden />
                Cargar primer movimiento
              </Link>
            </Button>
          </EmptyState>
        ) : (
          <>
            <section>
              <GroupedSection title="Señales">
                <DashboardSignalList signals={visibleSignals} />
              </GroupedSection>
            </section>

            <section className="split-grid">
              <GroupedSection title="Últimos movimientos">
                <FinanceList>
                  {snapshot.recentTransactions.map((row) => (
                    <FinanceRow
                      key={row.id}
                      icon={ArrowRightLeft}
                      title={row.detail || row.category?.name || "Movimiento sin detalle"}
                      meta={`${formatDate(row.date)} · ${row.type === "income" ? "Ingreso" : "Gasto"}`}
                      amount={<FinancialAmount value={row.amount} direction={row.type === "income" ? "income" : "expense"} showSign />}
                      direction={row.type === "income" ? "income" : "expense"}
                    />
                  ))}
                </FinanceList>
              </GroupedSection>

              {snapshot.topCategories.length > 0 ? (
                <GroupedSection eyebrow="Categorías" title="En qué se fue la plata">
                  <FinanceList>
                    {snapshot.topCategories.map((item) => (
                      <FinanceRow key={item.name} icon={Tags} title={item.name} amount={formatArs(item.total)} direction="neutral" />
                    ))}
                  </FinanceList>
                </GroupedSection>
              ) : null}
            </section>
          </>
        )}
      </ScreenScaffold>
    </KineticPage>
  );
}
