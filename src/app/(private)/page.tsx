import Link from "next/link";
import { ArrowRightLeft, Plus, Sparkles, Tags } from "lucide-react";

import { GroupedSection } from "@/components/app/grouped-section";
import { FlashMessage } from "@/components/flash-message";
import { KineticCard, KineticPage } from "@/components/app/kinetic";
import { FinanceHero } from "@/components/app/finance-hero";
import { FinanceList, FinanceRow } from "@/components/app/finance-list";
import { ScreenScaffold } from "@/components/app/screen-scaffold";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { PillChip } from "@/components/app/pill-chip";
import { getDashboardSnapshot } from "@/lib/dashboard";
import { requireHousehold } from "@/lib/auth";
import { formatArs, formatDate } from "@/lib/format";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { household } = await requireHousehold();
  const snapshot = await getDashboardSnapshot(household.id);
  const params = await searchParams;

  return (
    <KineticPage>
      <ScreenScaffold
        title="Resumen"
        description="Una lectura rápida de cómo viene el mes en casa."
        actions={
          <Button asChild size="icon" aria-label="Cargar movimiento">
            <Link href="/movimientos">
              <Plus className="size-5" aria-hidden />
            </Link>
          </Button>
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
          primaryLabel="Al mes gastas"
          primaryValue={formatArs(snapshot.expenses)}
          secondaryLabel="Eso al año es"
          secondaryValue={formatArs(snapshot.expenses * 12)}
          insight={
            snapshot.recentTransactions.length > 0
              ? `${snapshot.recentTransactions.length} movimientos recientes para revisar`
              : "Cargá tus primeros movimientos para ver señales útiles"
          }
        >
          <div className="mobile-scroll-row">
            <PillChip icon={Sparkles}>Este mes</PillChip>
            <PillChip active>
              Ahorro: {formatArs(snapshot.savings)}
            </PillChip>
          </div>
        </FinanceHero>
      </KineticCard>

      <KineticCard>
        <div className="finance-summary-strip">
          <div className="finance-summary-cell">
            <p className="stat-label">Ingresos</p>
            <p className="money-row mt-1 text-emerald-700">{formatArs(snapshot.incomes)}</p>
          </div>
          <div className="finance-summary-cell">
            <p className="stat-label">Gastos</p>
            <p className="money-row mt-1">{formatArs(snapshot.expenses)}</p>
          </div>
          <div className="finance-summary-cell">
            <p className="stat-label">Balance</p>
            <p className={snapshot.savings >= 0 ? "money-row mt-1 text-emerald-700" : "money-row mt-1 text-destructive"}>
              {formatArs(snapshot.savings)}
            </p>
          </div>
        </div>
      </KineticCard>

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
                    amount={formatArs(row.amount)}
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
