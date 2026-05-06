import Link from "next/link";
import { ArrowRightLeft, CalendarClock, HandCoins, Plus, Repeat2, Sparkles, Tags } from "lucide-react";

import { GroupedSection } from "@/components/app/grouped-section";
import { FlashMessage } from "@/components/flash-message";
import { KineticCard, KineticPage } from "@/components/app/kinetic";
import { FinanceHero } from "@/components/app/finance-hero";
import { FinanceList, FinanceRow } from "@/components/app/finance-list";
import { ScreenScaffold } from "@/components/app/screen-scaffold";
import { EmptyState } from "@/components/app/empty-state";
import { FinancialAmount } from "@/components/app/financial-amount";
import { Button } from "@/components/ui/button";
import { PillChip } from "@/components/app/pill-chip";
import { MonthSelector } from "@/components/app/month-selector";
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

  return (
    <KineticPage>
      <ScreenScaffold
        title="Resumen"
        description="Una lectura rápida de cómo viene el mes en casa."
        actions={
          <div className="flex items-center gap-2">
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

      <KineticCard>
        <FinanceHero
          greeting={`Hola, ${household.name}.`}
          primaryLabel="Gastos del mes"
          primaryValue={formatArs(snapshot.expenses)}
          secondaryLabel="Proyección de cierre"
          secondaryValue={formatArs(snapshot.projectedExpenses)}
          insight={
            snapshot.recentTransactions.length > 0
              ? `${expenseTrend}. Actualizado ${formatDate(snapshot.updatedAt)}`
              : "Cargá tus primeros movimientos para ver señales útiles"
          }
        >
          <div className="mobile-scroll-row">
            <PillChip icon={Sparkles}>Este mes</PillChip>
            <PillChip active>
              Balance: {formatArs(snapshot.savings)}
            </PillChip>
          </div>
        </FinanceHero>
      </KineticCard>

      <KineticCard>
        <div className="finance-summary-strip">
          <div className="finance-summary-cell">
            <p className="stat-label">Ingresos</p>
            <p className="money-row mt-1"><FinancialAmount value={snapshot.incomes} direction="income" /></p>
          </div>
          <div className="finance-summary-cell">
            <p className="stat-label">Gastos</p>
            <p className="money-row mt-1">{formatArs(snapshot.expenses)}</p>
          </div>
          <div className="finance-summary-cell">
            <p className="stat-label">Balance</p>
            <p className={snapshot.savings >= 0 ? "money-row mt-1 text-[var(--income)]" : "money-row mt-1 text-destructive"}>
              <FinancialAmount value={snapshot.savings} direction={snapshot.savings >= 0 ? "income" : "expense"} />
            </p>
          </div>
        </div>
      </KineticCard>

      <section className="grid gap-5 lg:grid-cols-3">
        <KineticCard>
          <GroupedSection eyebrow="Ritmo" title="Comparación">
            <FinanceList>
              <FinanceRow icon={CalendarClock} title="Mes anterior" meta={expenseTrend} amount={formatArs(snapshot.previousExpenses)} direction="neutral" />
              <FinanceRow icon={Sparkles} title="Proyección" meta="Si seguís a este ritmo" amount={formatArs(snapshot.projectedExpenses)} direction="expense" />
            </FinanceList>
          </GroupedSection>
        </KineticCard>
        <KineticCard>
          <GroupedSection eyebrow="Compromisos" title="Gastos fijos">
            {snapshot.upcomingBills.length === 0 ? (
              <FinanceList>
                <FinanceRow icon={Repeat2} title="Sin vencimientos próximos" meta="Los gastos fijos activos van a aparecer acá." direction="neutral" />
              </FinanceList>
            ) : (
              <FinanceList>
                <FinanceRow icon={Repeat2} title="Total mensual" meta="Compromisos activos" amount={formatArs(snapshot.recurringTotal)} direction="expense" />
                {snapshot.upcomingBills.slice(0, 2).map((bill) => (
                  <FinanceRow key={bill.id} icon={Repeat2} title={bill.name} meta={`Día ${bill.dueDay} · ${bill.paymentMethod?.name ?? "Sin medio"}`} amount={formatArs(bill.amount)} direction="expense" />
                ))}
              </FinanceList>
            )}
          </GroupedSection>
        </KineticCard>
        <KineticCard>
          <GroupedSection eyebrow="Saldos" title="Deudas activas">
            {snapshot.activeDebts.length === 0 ? (
              <FinanceList>
                <FinanceRow icon={HandCoins} title="Sin deudas activas" meta="Los saldos pendientes van a aparecer acá." direction="neutral" />
              </FinanceList>
            ) : (
              <FinanceList>
                <FinanceRow icon={HandCoins} title="Saldo total" meta={`${snapshot.activeDebts.length} activa${snapshot.activeDebts.length === 1 ? "" : "s"}`} amount={formatArs(snapshot.debtBalance)} direction="expense" />
                {snapshot.activeDebts.slice(0, 2).map((debt) => (
                  <FinanceRow key={debt.id} icon={HandCoins} title={debt.entityName} meta={debt.direction === "we_owe" ? "Debemos" : "Nos deben"} amount={formatArs(debt.remainingBalance)} direction={debt.direction === "we_owe" ? "expense" : "income"} />
                ))}
              </FinanceList>
            )}
          </GroupedSection>
        </KineticCard>
      </section>

      <section className="split-grid">
        <KineticCard>
          <GroupedSection eyebrow="Movimientos recientes" title="Última actividad">
            {snapshot.recentTransactions.length === 0 ? (
              <EmptyState
                icon={ArrowRightLeft}
                title="Todavía no hay movimientos"
                description="Empezá cargando los primeros desde la sección Movimientos."
                compact
              >
                <Button asChild variant="secondary">
                  <Link href="/movimientos">Ir a Movimientos</Link>
                </Button>
              </EmptyState>
            ) : (
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
            )}
          </GroupedSection>
        </KineticCard>

        <KineticCard>
          <GroupedSection eyebrow="Categorías del mes" title="En qué se fue la plata">
            {snapshot.topCategories.length === 0 ? (
              <EmptyState
                icon={Tags}
                title="Todavía no hay gastos categorizados"
                description="Apenas cargues gastos, acá vas a ver tus categorías más pesadas del mes."
                compact
              >
                <Button asChild variant="secondary">
                  <Link href="/movimientos">Cargar un gasto</Link>
                </Button>
              </EmptyState>
            ) : (
              <FinanceList>
                {snapshot.topCategories.map((item) => (
                  <FinanceRow key={item.name} icon={Tags} title={item.name} amount={formatArs(item.total)} direction="neutral" />
                ))}
              </FinanceList>
            )}
          </GroupedSection>
        </KineticCard>
      </section>
      </ScreenScaffold>
    </KineticPage>
  );
}
