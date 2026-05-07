import { deleteCategoryAction, saveCategoryAction } from "@/app/actions/resources";
import { Baby, BadgeDollarSign, BookOpen, BriefcaseBusiness, Bus, Car, Clapperboard, Dumbbell, Film, Gamepad2, Gift, GraduationCap, HeartPulse, Home, Laptop, Lightbulb, Music2, Palette, PawPrint, Plane, ReceiptText, Shirt, ShoppingCart, Sparkles, Tags, Trash2, Utensils, Wifi, Wrench, type LucideIcon } from "lucide-react";
import { FlashMessage } from "@/components/flash-message";
import { ConfirmForm } from "@/components/app/confirm-form";
import { GroupedSection } from "@/components/app/grouped-section";
import { KineticPage } from "@/components/app/kinetic";
import { ScreenHeader } from "@/components/app/screen-header";
import { EmptyState } from "@/components/app/empty-state";
import { SubmitButton } from "@/components/app/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResourceCreateButton, ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { Button } from "@/components/ui/button";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";

const FALLBACK_ICONS: LucideIcon[] = [
  Sparkles,
  Gift,
  ShoppingCart,
  Film,
  Shirt,
  Baby,
  BookOpen,
  BriefcaseBusiness,
  Bus,
  BadgeDollarSign,
  Clapperboard,
  Laptop,
  Lightbulb,
  Music2,
  Palette,
  Plane,
  Wrench,
];

function categoryIcon(name: string, used: Set<LucideIcon>, index: number): LucideIcon {
  const normalized = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const semantic =
    normalized.includes("comida") || normalized.includes("super") ? Utensils :
    normalized.includes("educ") ? GraduationCap :
    normalized.includes("hogar") ? Home :
    normalized.includes("impuesto") ? ReceiptText :
    normalized.includes("masc") ? PawPrint :
    normalized.includes("ocio") ? Gamepad2 :
    normalized.includes("salud") ? HeartPulse :
    normalized.includes("servicio") || normalized.includes("internet") ? Wifi :
    normalized.includes("transporte") ? Car :
    normalized.includes("deporte") ? Dumbbell :
    FALLBACK_ICONS[index % FALLBACK_ICONS.length];
  if (!used.has(semantic)) return semantic;
  return FALLBACK_ICONS.find((Icon) => !used.has(Icon)) ?? semantic;
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

  const usedIcons = new Set<LucideIcon>();

  const createCategory = (
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
  );

  return (
    <KineticPage className="space-y-5">
        <ScreenHeader title="Categorías" action={createCategory} />
        <FlashMessage message={params.error} tone="error" />
        <FlashMessage message={params.message} tone="success" />
        <GroupedSection>
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
                {categories.map((category, index) => (
                  (() => {
                    const Icon = categoryIcon(category.name, usedIcons, index);
                    usedIcons.add(Icon);
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
    </KineticPage>
  );
}
