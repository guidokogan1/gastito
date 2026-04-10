import { FlashMessage } from "@/components/flash-message";
import { StatCard } from "@/components/stat-card";
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
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Resumen</p>
          <h2>Tu hogar, ordenado en un vistazo</h2>
          <p className="muted">Todo el producto público arranca en ARS y con carga manual.</p>
        </div>
      </header>

      <FlashMessage message={params.message} />

      <section className="stats-grid">
        <StatCard label="Ingresos del mes" value={formatArs(snapshot.incomes)} hint="Total cargado como ingreso." />
        <StatCard label="Gastos del mes" value={formatArs(snapshot.expenses)} hint="Total cargado como egreso." />
        <StatCard label="Ahorro del mes" value={formatArs(snapshot.savings)} hint="Ingresos menos gastos." />
      </section>

      <section className="split-grid">
        <div className="card">
          <div className="page-header">
            <div>
              <p className="eyebrow">Movimientos recientes</p>
              <h2>Última actividad</h2>
            </div>
          </div>
          {snapshot.recentTransactions.length === 0 ? (
            <div className="empty">Todavía no hay movimientos. Empezá cargando los primeros desde la sección Movimientos.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Detalle</th>
                    <th>Monto</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.recentTransactions.map((row) => (
                    <tr key={row.id}>
                      <td>{formatDate(row.date)}</td>
                      <td>{row.detail || row.category?.name || "Movimiento sin detalle"}</td>
                      <td>{formatArs(row.amount)}</td>
                      <td>{row.type === "income" ? "Ingreso" : "Gasto"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <p className="eyebrow">Categorías del mes</p>
          <h2>En qué se fue la plata</h2>
          {snapshot.topCategories.length === 0 ? (
            <div className="empty">Apenas cargues gastos, acá vas a ver tus categorías más pesadas del mes.</div>
          ) : (
            <div className="stack">
              {snapshot.topCategories.map((item) => (
                <div key={item.name} className="card">
                  <strong>{item.name}</strong>
                  <p className="muted">{formatArs(item.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
