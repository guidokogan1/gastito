import { deleteCategoryAction, saveCategoryAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    where: { householdId: household.id },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Categorías</p>
          <h2>Catálogo editable por hogar</h2>
          <p className="muted">Podés crear, renombrar, desactivar o borrar las categorías que todavía no estén en uso.</p>
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
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.isActive ? "Activa" : "Inactiva"}</td>
                    <td>
                      <form action={saveCategoryAction} className="inline-form">
                        <input type="hidden" name="id" value={category.id} />
                        <input name="name" defaultValue={category.name} aria-label={`Nombre ${category.name}`} />
                        <label className="checkbox-line">
                          <input type="checkbox" name="isActive" defaultChecked={category.isActive} />
                          Activa
                        </label>
                        <button type="submit" className="button button-secondary">Guardar</button>
                      </form>
                    </td>
                    <td>
                      <form action={deleteCategoryAction}>
                        <input type="hidden" name="id" value={category.id} />
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
          <p className="eyebrow">Nueva categoría</p>
          <form action={saveCategoryAction} className="form-grid">
            <div className="field">
              <label htmlFor="name">Nombre</label>
              <input id="name" name="name" placeholder="Ej. Colegio" required />
            </div>
            <label className="checkbox-line">
              <input type="checkbox" name="isActive" defaultChecked />
              Dejar activa
            </label>
            <button type="submit" className="button">Crear categoría</button>
          </form>
        </section>
      </section>
    </>
  );
}
