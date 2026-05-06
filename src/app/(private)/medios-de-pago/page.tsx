import { deletePaymentMethodAction, savePaymentMethodAction } from "@/app/actions/resources";
import { CreditCard } from "lucide-react";
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
        description="Tarjetas, billeteras y medios que usa tu hogar."
        actions={
          <ResourceSheet title="Nuevo medio" description="Agregá una tarjeta, billetera o cuenta de pago." trigger={<ResourceCreateButton />}>
            <form action={savePaymentMethodAction} className="space-y-4">
              <section className="grouped-form-section space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" placeholder="Ej. Tarjeta Visa" required autoFocus />
                </div>
                <CheckboxLine name="isActive" defaultChecked>Dejar activo</CheckboxLine>
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
        <GroupedSection eyebrow="Catálogo" title="Medios del hogar">
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
                    description="Editar medio de pago"
                    trigger={
                      <ResourceRowShell
                        icon={<CreditCard className="size-4" aria-hidden />}
                        title={method.name}
                        meta={method.isActive ? "Disponible para movimientos" : "Oculto en nuevos movimientos"}
                        trailing={<StatusPill tone={method.isActive ? "success" : "neutral"}>{method.isActive ? "Activo" : "Inactivo"}</StatusPill>}
                      />
                    }
                  >
                    <form action={savePaymentMethodAction} className="space-y-4">
                      <section className="grouped-form-section space-y-3">
                        <input type="hidden" name="id" value={method.id} />
                        <div className="space-y-1.5">
                          <Label htmlFor={`method-${method.id}`}>Nombre</Label>
                          <Input id={`method-${method.id}`} name="name" defaultValue={method.name} />
                        </div>
                        <CheckboxLine name="isActive" defaultChecked={method.isActive}>
                          Activo
                        </CheckboxLine>
                      </section>
                      <div className="sheet-action-bar">
                        <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
                          Guardar cambios
                        </SubmitButton>
                      </div>
                    </form>
                    <DangerZone description="Si el medio ya está en uso, ocultalo desmarcando Activo para conservar el historial.">
                      <ConfirmForm action={deletePaymentMethodAction} confirm={`¿Borrar el medio “${method.name}”? Esta acción no se puede deshacer.`}>
                        <input type="hidden" name="id" value={method.id} />
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
