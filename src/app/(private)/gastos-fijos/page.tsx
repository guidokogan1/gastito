import { deleteRecurringBillAction, saveRecurringBillAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs } from "@/lib/format";

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const [bills, paymentMethods] = await Promise.all([
    prisma.recurringBill.findMany({
      where: { householdId: household.id },
      include: { paymentMethod: true },
      orderBy: [{ isActive: "desc" }, { dueDay: "asc" }],
    }),
    prisma.paymentMethod.findMany({
      where: { householdId: household.id, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Gastos fijos</p>
          <h2>Compromisos que vuelven todos los meses</h2>
          <p className="muted">Una versión simple del seguimiento mensual, sin importaciones ni perfiles técnicos.</p>
        </div>
      </header>

      <FlashMessage message={params.error} tone="error" />

      <section className="crud-grid">
        <div className="card">
          {bills.length === 0 ? (
            <div className="empty">Todavía no hay gastos fijos cargados.</div>
          ) : (
            <div className="stack">
              {bills.map((bill) => (
                <div key={bill.id} className="card">
                  <div className="page-header">
                    <div>
                      <strong>{bill.name}</strong>
                      <p className="muted">
                        Vence el día {bill.dueDay} · {formatArs(bill.amount)} · {bill.paymentMethod?.name || "Sin medio"}
                      </p>
                    </div>
                    <form action={deleteRecurringBillAction}>
                      <input type="hidden" name="id" value={bill.id} />
                      <button type="submit" className="button button-danger">Borrar</button>
                    </form>
                  </div>
                  <form action={saveRecurringBillAction} className="form-grid">
                    <input type="hidden" name="id" value={bill.id} />
                    <input name="name" defaultValue={bill.name} />
                    <input name="amount" type="number" step="0.01" defaultValue={bill.amount} />
                    <input name="dueDay" type="number" min="1" max="31" defaultValue={bill.dueDay} />
                    <select name="paymentMethodId" defaultValue={bill.paymentMethodId ?? ""}>
                      <option value="">Sin medio</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>{method.name}</option>
                      ))}
                    </select>
                    <textarea name="notes" defaultValue={bill.notes ?? ""} />
                    <label className="checkbox-line">
                      <input type="checkbox" name="isActive" defaultChecked={bill.isActive} />
                      Activo
                    </label>
                    <button type="submit" className="button button-secondary">Guardar cambios</button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        <section className="card">
          <p className="eyebrow">Nuevo gasto fijo</p>
          <form action={saveRecurringBillAction} className="form-grid">
            <div className="field">
              <label htmlFor="name">Nombre</label>
              <input id="name" name="name" placeholder="Ej. Internet" required />
            </div>
            <div className="field">
              <label htmlFor="amount">Monto</label>
              <input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div className="field">
              <label htmlFor="dueDay">Día de vencimiento</label>
              <input id="dueDay" name="dueDay" type="number" min="1" max="31" required />
            </div>
            <div className="field">
              <label htmlFor="paymentMethodId">Medio de pago</label>
              <select id="paymentMethodId" name="paymentMethodId" defaultValue="">
                <option value="">Sin medio</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>{method.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="notes">Notas</label>
              <textarea id="notes" name="notes" />
            </div>
            <label className="checkbox-line">
              <input type="checkbox" name="isActive" defaultChecked />
              Dejar activo
            </label>
            <button type="submit" className="button">Guardar gasto fijo</button>
          </form>
        </section>
      </section>
    </>
  );
}
