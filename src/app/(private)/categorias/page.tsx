import { deleteCategoryAction, saveCategoryAction } from "@/app/actions/resources";
import { Car, Dumbbell, Gamepad2, GraduationCap, HeartPulse, Home, PawPrint, ReceiptText, Sparkles, Tags, Trash2, Utensils, Wifi, type LucideIcon } from "lucide-react";
import { FlashMessage } from "@/components/flash-message";
import { ConfirmForm } from "@/components/app/confirm-form";
import { GroupedSection } from "@/components/app/grouped-section";
import { KineticPage } from "@/components/app/kinetic";
import { ScreenScaffold } from "@/components/app/screen-scaffold";
import { EmptyState } from "@/components/app/empty-state";
import { SubmitButton } from "@/components/app/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResourceCreateButton, ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { Button } from "@/components/ui/button";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";

function categoryIcon(name: string): LucideIcon {
  const normalized = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  if (normalized.includes("comida") || normalized.includes("super")) return Utensils;
  if (normalized.includes("educ")) return GraduationCap;
  if (normalized.includes("hogar")) return Home;
  if (normalized.includes("impuesto")) return ReceiptText;
  if (normalized.includes("masc")) return PawPrint;
  if (normalized.includes("ocio")) return Gamepad2;
  if (normalized.includes("salud")) return HeartPulse;
  if (normalized.includes("servicio") || normalized.includes("internet")) return Wifi;
  if (normalized.includes("transporte")) return Car;
  if (normalized.includes("deporte")) return Dumbbell;
  return Sparkles;
}

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
        actions={
          <ResourceSheet title="Nueva categoría" trigger={<ResourceCreateButton />}>
            <form action={saveCategoryAction} className="space-y-4">
              <section className="grouped-form-section space-y-3">
                <input type="hidden" name="isActive" value="on" />
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" placeholder="Ej. Colegio" required autoFocus />
                </div>
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
        <GroupedSection title="Categorías">
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
                  (() => {
                    const Icon = categoryIcon(category.name);
                    return (
                  <ResourceSheet
                    key={category.id}
                    title={category.name}
                    headerAction={
                      <ConfirmForm action={deleteCategoryAction} confirm={`¿Borrar la categoría “${category.name}”? Esta acción no se puede deshacer.`}>
                        <input type="hidden" name="id" value={category.id} />
                        <Button type="submit" variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Borrar categoría">
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </ConfirmForm>
                    }
                    trigger={
                      <ResourceRowShell
                        icon={<Icon className="size-4" aria-hidden />}
                        title={category.name}
                      />
                    }
                  >
                    <form action={saveCategoryAction} className="space-y-4">
                      <section className="grouped-form-section space-y-3">
                        <input type="hidden" name="id" value={category.id} />
                        <input type="hidden" name="isActive" value="on" />
                        <div className="space-y-1.5">
                          <Label htmlFor={`category-${category.id}`}>Nombre</Label>
                          <Input id={`category-${category.id}`} name="name" defaultValue={category.name} />
                        </div>
                      </section>
                      <div className="sheet-action-bar">
                        <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
                          Guardar cambios
                        </SubmitButton>
                      </div>
                    </form>
                  </ResourceSheet>
                    );
                  })()
                ))}
              </div>
            )}
        </GroupedSection>
      </ScreenScaffold>
    </KineticPage>
  );
}
