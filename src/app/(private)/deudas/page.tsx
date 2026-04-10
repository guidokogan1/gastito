import { deleteDebtAction, saveDebtAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs } from "@/lib/format";

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const debts = await prisma.debt.findMany({
    where: { householdId: household.id },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Deudas</p>
          <h2>Qué debe el hogar y qué le deben</h2>
          <p className="muted">Sin inversiones ni FX: foco total en el seguimiento simple de saldos.</p>
        </div>
      </header>

      <FlashMessage message={params.error} tone="error" />

      <section className="crud-grid">
        <div className="card">
          {debts.length === 0 ? (
            <div className="empty">Todavía no hay deudas cargadas.</div>
          ) : (
            <div className="stack">
              {debts.map((debt) => (
                <div key={debt.id} className="card">
                  <div className="page-header">
                    <div>
                      <strong>{debt.entityName}</strong>
                      <p className="muted">
                        {debt.direction === "we_owe" ? "Debemos" : "Nos deben"} · saldo {formatArs(debt.remainingBalance)}
                      </p>
                    </div>
                    <form action={deleteDebtAction}>
                      <input type="hidden" name="id" value={debt.id} />
                      <button type="submit" className="button button-danger">Borrar</button>
                    </form>
                  </div>
                  <form action={saveDebtAction} className="form-grid">
                    <input type="hidden" name="id" value={debt.id} />
                    <input name="entityName" defaultValue={debt.entityName} />
                    <select name="direction" defaultValue={debt.direction}>
                      <option value="we_owe">Debemos</option>
                      <option value="they_owe_us">Nos deben</option>
                    </select>
                    <input name="originalAmount" type="number" step="0.01" defaultValue={debt.originalAmount} />
                    <input name="remainingBalance" type="number" step="0.01" defaultValue={debt.remainingBalance} />
                    <textarea name="notes" defaultValue={debt.notes ?? ""} />
                    <label className="checkbox-line">
                      <input type="checkbox" name="isActive" defaultChecked={debt.isActive} />
                      Activa
                    </label>
                    <button type="submit" className="button button-secondary">Guardar cambios</button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        <section className="card">
          <p className="eyebrow">Nueva deuda</p>
          <form action={saveDebtAction} className="form-grid">
            <div className="field">
              <label htmlFor="entityName">Persona o entidad</label>
              <input id="entityName" name="entityName" required />
            </div>
            <div className="field">
              <label htmlFor="direction">Tipo</label>
              <select id="direction" name="direction" defaultValue="we_owe">
                <option value="we_owe">Debemos</option>
                <option value="they_owe_us">Nos deben</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="originalAmount">Monto original</label>
              <input id="originalAmount" name="originalAmount" type="number" step="0.01" required />
            </div>
            <div className="field">
              <label htmlFor="remainingBalance">Saldo pendiente</label>
              <input id="remainingBalance" name="remainingBalance" type="number" step="0.01" required />
            </div>
            <div className="field">
              <label htmlFor="notes">Notas</label>
              <textarea id="notes" name="notes" />
            </div>
            <label className="checkbox-line">
              <input type="checkbox" name="isActive" defaultChecked />
              Dejar activa
            </label>
            <button type="submit" className="button">Guardar deuda</button>
          </form>
        </section>
      </section>
    </>
  );
}
