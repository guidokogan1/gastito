import { deletePaymentMethodAction, savePaymentMethodAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function PaymentMethodsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const methods = await prisma.paymentMethod.findMany({
    where: { householdId: household.id },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Medios de pago</p>
          <h2>Qué usa este hogar para pagar</h2>
          <p className="muted">Cada familia puede tener sus propios medios sin compartirlos con otras.</p>
        </div>
      </header>

      <FlashMessage message={params.error} tone="error" />

      <section className="crud-grid">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Editar</th>
                  <th>Borrar</th>
                </tr>
              </thead>
              <tbody>
                {methods.map((method) => (
                  <tr key={method.id}>
                    <td>{method.name}</td>
                    <td>{method.isActive ? "Activo" : "Inactivo"}</td>
                    <td>
                      <form action={savePaymentMethodAction} className="inline-form">
                        <input type="hidden" name="id" value={method.id} />
                        <input name="name" defaultValue={method.name} aria-label={`Nombre ${method.name}`} />
                        <label className="checkbox-line">
                          <input type="checkbox" name="isActive" defaultChecked={method.isActive} />
                          Activo
                        </label>
                        <button type="submit" className="button button-secondary">Guardar</button>
                      </form>
                    </td>
                    <td>
                      <form action={deletePaymentMethodAction}>
                        <input type="hidden" name="id" value={method.id} />
                        <button type="submit" className="button button-danger">Borrar</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <section className="card">
          <p className="eyebrow">Nuevo medio</p>
          <form action={savePaymentMethodAction} className="form-grid">
            <div className="field">
              <label htmlFor="name">Nombre</label>
              <input id="name" name="name" placeholder="Ej. Tarjeta Visa" required />
            </div>
            <label className="checkbox-line">
              <input type="checkbox" name="isActive" defaultChecked />
              Dejar activo
            </label>
            <button type="submit" className="button">Crear medio</button>
          </form>
        </section>
      </section>
    </>
  );
}
