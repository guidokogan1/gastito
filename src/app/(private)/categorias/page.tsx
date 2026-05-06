import { deleteCategoryAction, saveCategoryAction } from "@/app/actions/resources";
import { Tags } from "lucide-react";
import { FlashMessage } from "@/components/flash-message";
import { ConfirmForm } from "@/components/app/confirm-form";
import { GroupedSection } from "@/components/app/grouped-section";
import { KineticPage } from "@/components/app/kinetic";
import { ScreenScaffold } from "@/components/app/screen-scaffold";
import { EmptyState } from "@/components/app/empty-state";
import { SubmitButton } from "@/components/app/submit-button";
import { CheckboxLine } from "@/components/ui/checkbox-line";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResourceCreateButton, ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { StatusPill } from "@/components/app/pill-chip";
import { DangerZone } from "@/components/app/danger-zone";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    where: { householdId: household.id, deletedAt: null },
    select: { id: true, name: true, isActive: true },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <KineticPage>
      <ScreenScaffold
        title="Categorías"
        description="Ordená tus gastos con etiquetas simples, rápidas de editar."
        actions={
          <ResourceSheet title="Nueva categoría" description="Creá una etiqueta para clasificar movimientos." trigger={<ResourceCreateButton />}>
            <form action={saveCategoryAction} className="space-y-4">
              <section className="grouped-form-section space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" placeholder="Ej. Colegio" required autoFocus />
                </div>
                <CheckboxLine name="isActive" defaultChecked>
                  Dejar activa
                </CheckboxLine>
              </section>
              <div className="sheet-action-bar">
                <SubmitButton type="submit" className="w-full" pendingText="Creando...">
                  Crear categoría
                </SubmitButton>
              </div>
            </form>
          </ResourceSheet>
        }
      >
        <FlashMessage message={params.error} tone="error" />
        <FlashMessage message={params.message} tone="success" />
        <GroupedSection eyebrow="Catálogo" title="Categorías del hogar">
            {categories.length === 0 ? (
              <EmptyState
                icon={Tags}
                title="Todavía no hay categorías"
                description="Creá tu primera categoría para ordenar gastos e ingresos."
                compact
                className="m-4"
              />
            ) : (
              <div>
                {categories.map((category) => (
                  <ResourceSheet
                    key={category.id}
                    title={category.name}
                    description="Editar categoría"
                    trigger={
                      <ResourceRowShell
                        icon={<Tags className="size-4" aria-hidden />}
                        title={category.name}
                        meta={category.isActive ? "Lista para usar" : "Oculta en nuevos movimientos"}
                        trailing={<StatusPill tone={category.isActive ? "success" : "neutral"}>{category.isActive ? "Activa" : "Inactiva"}</StatusPill>}
                      />
                    }
                  >
                    <form action={saveCategoryAction} className="space-y-4">
                      <section className="grouped-form-section space-y-3">
                        <input type="hidden" name="id" value={category.id} />
                        <div className="space-y-1.5">
                          <Label htmlFor={`category-${category.id}`}>Nombre</Label>
                          <Input id={`category-${category.id}`} name="name" defaultValue={category.name} />
                        </div>
                        <CheckboxLine name="isActive" defaultChecked={category.isActive}>
                          Activa
                        </CheckboxLine>
                      </section>
                      <div className="sheet-action-bar">
                        <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
                          Guardar cambios
                        </SubmitButton>
                      </div>
                    </form>
                    <DangerZone description="Si la categoría tiene movimientos, ocultala desmarcando Activa. Borrar queda reservado para categorías sin uso.">
                      <ConfirmForm action={deleteCategoryAction} confirm={`¿Borrar la categoría “${category.name}”? Esta acción no se puede deshacer.`}>
                        <input type="hidden" name="id" value={category.id} />
                        <SubmitButton type="submit" variant="destructive" className="w-full" pendingText="Borrando...">
                          Borrar
                        </SubmitButton>
                      </ConfirmForm>
                    </DangerZone>
                  </ResourceSheet>
                ))}
              </div>
            )}
        </GroupedSection>
      </ScreenScaffold>
    </KineticPage>
  );
}
