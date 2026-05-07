import { deletePaymentMethodAction, savePaymentMethodAction } from "@/app/actions/resources";
import { BadgeDollarSign, Banknote, Building2, CircleDollarSign, CreditCard, Landmark, QrCode, Receipt, Smartphone, Trash2, WalletCards, type LucideIcon } from "lucide-react";
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
  const methodIcons = [CreditCard, WalletCards, Smartphone, Banknote, Landmark, QrCode, BadgeDollarSign, CircleDollarSign, Receipt, Building2];
  const usedMethodIcons = new Set<LucideIcon>();

  const createMethod = (
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
  );

  return (
    <KineticPage className="space-y-5">
        <ScreenHeader title="Medios" action={createMethod} />
        <FlashMessage message={params.error} tone="error" />
        <FlashMessage message={params.message} tone="success" />
        <GroupedSection>
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
                {methods.map((method, index) => {
                  const proposedIcon = methodIcons[index % methodIcons.length];
                  const Icon = usedMethodIcons.has(proposedIcon)
                    ? methodIcons.find((item) => !usedMethodIcons.has(item)) ?? proposedIcon
                    : proposedIcon;
                  usedMethodIcons.add(Icon);
                  return (
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
                      <ResourceRowShell icon={<Icon className="size-4" aria-hidden />} title={method.name} />
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
                );
                })}
              </div>
            )}
        </GroupedSection>
    </KineticPage>
  );
}
