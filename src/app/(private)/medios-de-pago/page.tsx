import { deletePaymentMethodAction, savePaymentMethodAction } from "@/app/actions/resources";
import { CreditCard, Trash2 } from "lucide-react";
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

export default async function PaymentMethodsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const methods = await prisma.paymentMethod.findMany({
    where: { householdId: household.id, deletedAt: null },
    select: { id: true, name: true, isActive: true },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <KineticPage>
      <ScreenScaffold
        title="Medios de pago"
        actions={
          <ResourceSheet title="Nuevo medio" trigger={<ResourceCreateButton />}>
            <form action={savePaymentMethodAction} className="space-y-4">
              <section className="grouped-form-section space-y-3">
                <input type="hidden" name="isActive" value="on" />
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" placeholder="Ej. Tarjeta Visa" required autoFocus />
                </div>
              </section>
              <div className="sheet-action-bar">
                <SubmitButton type="submit" className="w-full" pendingText="Creando...">Crear medio</SubmitButton>
              </div>
            </form>
          </ResourceSheet>
        }
      >
        <FlashMessage message={params.error} tone="error" />
        <FlashMessage message={params.message} tone="success" />
        <GroupedSection title="Medios">
            {methods.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="Todavía no hay medios"
                description="Agregá tu primer medio de pago para registrar movimientos más rápido."
                compact
                className="m-4"
              />
            ) : (
              <div>
                {methods.map((method) => (
                  <ResourceSheet
                    key={method.id}
                    title={method.name}
                    headerAction={
                      <ConfirmForm action={deletePaymentMethodAction} confirm={`¿Borrar el medio “${method.name}”? Esta acción no se puede deshacer.`}>
                        <input type="hidden" name="id" value={method.id} />
                        <Button type="submit" variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Borrar medio">
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </ConfirmForm>
                    }
                    trigger={
                      <ResourceRowShell
                        icon={<CreditCard className="size-4" aria-hidden />}
                        title={method.name}
                      />
                    }
                  >
                    <form action={savePaymentMethodAction} className="space-y-4">
                      <section className="grouped-form-section space-y-3">
                        <input type="hidden" name="id" value={method.id} />
                        <input type="hidden" name="isActive" value="on" />
                        <div className="space-y-1.5">
                          <Label htmlFor={`method-${method.id}`}>Nombre</Label>
                          <Input id={`method-${method.id}`} name="name" defaultValue={method.name} />
                        </div>
                      </section>
                      <div className="sheet-action-bar">
                        <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
                          Guardar cambios
                        </SubmitButton>
                      </div>
                    </form>
                  </ResourceSheet>
                ))}
              </div>
            )}
        </GroupedSection>
      </ScreenScaffold>
    </KineticPage>
  );
}
