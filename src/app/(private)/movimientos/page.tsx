import { deleteTransactionAction, saveTransactionAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatArs, formatDate } from "@/lib/format";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const [transactions, accounts, categories, methods] = await Promise.all([
    prisma.transaction.findMany({
      where: { householdId: household.id },
      include: {
        account: true,
        category: true,
        paymentMethod: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.account.findMany({ where: { householdId: household.id, isActive: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { householdId: household.id, isActive: true }, orderBy: { name: "asc" } }),
    prisma.paymentMethod.findMany({ where: { householdId: household.id, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Movimientos</p>
          <h2>Ingresos y gastos del hogar</h2>
          <p className="muted">El corazón del producto público: manual, simple y 100% orientado a ARS.</p>
        </div>
      </header>

      <FlashMessage message={params.error} tone="error" />

      <section className="crud-grid">
        <div className="card">
          {transactions.length === 0 ? (
            <div className="empty">Todavía no cargaste movimientos. Empezá con el formulario de la derecha.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Detalle</th>
                    <th>Monto</th>
                    <th>Tipo</th>
                    <th>Editar</th>
                    <th>Borrar</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>{transaction.detail || "-"}</td>
                      <td>{formatArs(transaction.amount)}</td>
                      <td>{transaction.type === "income" ? "Ingreso" : "Gasto"}</td>
                      <td>
                        <form action={saveTransactionAction} className="inline-form">
                          <input type="hidden" name="id" value={transaction.id} />
                          <input name="date" type="date" defaultValue={transaction.date.toISOString().slice(0, 10)} />
                          <input name="amount" type="number" step="0.01" defaultValue={transaction.amount} />
                          <select name="type" defaultValue={transaction.type}>
                            <option value="expense">Gasto</option>
                            <option value="income">Ingreso</option>
                          </select>
                          <select name="accountId" defaultValue={transaction.accountId ?? ""}>
                            <option value="">Sin cuenta</option>
                            {accounts.map((account) => (
                              <option key={account.id} value={account.id}>{account.name}</option>
                            ))}
                          </select>
                          <select name="categoryId" defaultValue={transaction.categoryId ?? ""}>
                            <option value="">Sin categoría</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                          </select>
                          <select name="paymentMethodId" defaultValue={transaction.paymentMethodId ?? ""}>
                            <option value="">Sin medio</option>
                            {methods.map((method) => (
                              <option key={method.id} value={method.id}>{method.name}</option>
                            ))}
                          </select>
                          <input name="detail" defaultValue={transaction.detail ?? ""} placeholder="Detalle" />
                          <button type="submit" className="button button-secondary">Guardar</button>
                        </form>
                      </td>
                      <td>
                        <form action={deleteTransactionAction}>
                          <input type="hidden" name="id" value={transaction.id} />
                          <button type="submit" className="button button-danger">Borrar</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <section className="card">
          <p className="eyebrow">Nuevo movimiento</p>
          <form action={saveTransactionAction} className="form-grid">
            <div className="field">
              <label htmlFor="date">Fecha</label>
              <input id="date" name="date" type="date" required />
            </div>
            <div className="field">
              <label htmlFor="amount">Monto</label>
              <input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div className="field">
              <label htmlFor="type">Tipo</label>
              <select id="type" name="type" defaultValue="expense">
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="accountId">Cuenta</label>
              <select id="accountId" name="accountId" defaultValue="">
                <option value="">Sin cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="categoryId">Categoría</label>
              <select id="categoryId" name="categoryId" defaultValue="">
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="paymentMethodId">Medio de pago</label>
              <select id="paymentMethodId" name="paymentMethodId" defaultValue="">
                <option value="">Sin medio</option>
                {methods.map((method) => (
                  <option key={method.id} value={method.id}>{method.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="detail">Detalle</label>
              <input id="detail" name="detail" placeholder="Ej. Compra semanal" />
            </div>
            <button type="submit" className="button">Guardar movimiento</button>
          </form>
        </section>
      </section>
    </>
  );
}
