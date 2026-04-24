import Link from "next/link";
import { ArrowRightLeft, Tags } from "lucide-react";

import { FlashMessage } from "@/components/flash-message";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="space-y-8">
      <PageHeader
        title="Resumen"
        description="Todo el producto público arranca en ARS y con carga manual."
        actions={
          <Button asChild>
            <Link href="/movimientos">Cargar movimiento</Link>
          </Button>
        }
      />

      <FlashMessage message={params.message} tone="success" />
      {snapshot.degraded ? (
        <FlashMessage
          tone="warning"
          message="No pudimos conectar a la base de datos en este momento. Mostramos un resumen vacío para que puedas seguir navegando."
        />
      ) : null}

      <section className="dashboard-metrics stats-grid">
        <StatCard
          className="stat-card-wow"
          label="Ingresos del mes"
          value={formatArs(snapshot.incomes)}
          hint="Total cargado como ingreso."
        />
        <StatCard
          className="stat-card-wow"
          label="Gastos del mes"
          value={formatArs(snapshot.expenses)}
          hint="Total cargado como egreso."
        />
        <StatCard
          className="stat-card-wow"
          label="Ahorro del mes"
          value={formatArs(snapshot.savings)}
          hint="Ingresos menos gastos."
        />
      </section>

      <section className="split-grid">
        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Movimientos recientes</p>
            <CardTitle className="section-title">Última actividad</CardTitle>
          </CardHeader>
          <CardContent>
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
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Detalle</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshot.recentTransactions.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(row.date)}</TableCell>
                        <TableCell>{row.detail || row.category?.name || "Movimiento sin detalle"}</TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">{formatArs(row.amount)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.type === "income" ? "Ingreso" : "Gasto"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </CardPage>

        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Categorías del mes</p>
            <CardTitle className="section-title">En qué se fue la plata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
              <div className="grid gap-2">
                {snapshot.topCategories.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-border/70 bg-card/30 px-4 py-3">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground tabular-nums">{formatArs(item.total)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CardPage>
      </section>
    </div>
  );
}
