import { deleteAccountAction, saveAccountAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const accounts = await prisma.account.findMany({
    where: { householdId: household.id },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Cuentas</p>
          <h2>Dónde vive la plata</h2>
          <p className="muted">Podés usar cuentas de efectivo, banco o billetera virtual según tu hogar.</p>
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
                  <th>Tipo</th>
                  <th>Editar</th>
                  <th>Borrar</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.name}</td>
                    <td>{account.type}</td>
                    <td>
                      <form action={saveAccountAction} className="inline-form">
                        <input type="hidden" name="id" value={account.id} />
                        <input name="name" defaultValue={account.name} />
                        <input name="type" defaultValue={account.type} />
                        <label className="checkbox-line">
                          <input type="checkbox" name="isActive" defaultChecked={account.isActive} />
                          Activa
                        </label>
                        <button type="submit" className="button button-secondary">Guardar</button>
                      </form>
                    </td>
                    <td>
                      <form action={deleteAccountAction}>
                        <input type="hidden" name="id" value={account.id} />
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
          <p className="eyebrow">Nueva cuenta</p>
          <form action={saveAccountAction} className="form-grid">
            <div className="field">
              <label htmlFor="name">Nombre</label>
              <input id="name" name="name" placeholder="Ej. Cuenta sueldo" required />
            </div>
            <div className="field">
              <label htmlFor="type">Tipo</label>
              <input id="type" name="type" placeholder="Ej. bank" required />
            </div>
            <label className="checkbox-line">
              <input type="checkbox" name="isActive" defaultChecked />
              Dejar activa
            </label>
            <button type="submit" className="button">Crear cuenta</button>
          </form>
        </section>
      </section>
    </>
  );
}
