import { Landmark, Trash2 } from "lucide-react";

import { deleteBankAction, saveBankAction } from "@/app/actions/resources";
import { ConfirmForm } from "@/components/app/confirm-form";
import { EmptyState } from "@/components/app/empty-state";
import { GroupedSection } from "@/components/app/grouped-section";
import { KineticPage } from "@/components/app/kinetic";
import { ResourceCreateButton, ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { ScreenHeader } from "@/components/app/screen-header";
import { SubmitButton } from "@/components/app/submit-button";
import { FlashMessage } from "@/components/flash-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireHousehold } from "@/lib/auth";
import { prisma } from "@/lib/db";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("es-AR"))
    .join("");
}

export default async function BanksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const banks = await prisma.bank.findMany({
    where: { householdId: household.id, deletedAt: null },
    select: {
      id: true,
      name: true,
      color: true,
      paymentMethods: {
        where: { deletedAt: null },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const createBank = (
    <ResourceSheet title="Nuevo banco" trigger={<ResourceCreateButton />}>
      <form action={saveBankAction} className="space-y-4">
        <section className="grouped-form-section space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" placeholder="Ej. Galicia" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="color">Color</Label>
            <Input id="color" name="color" defaultValue="#0E3B2E" />
          </div>
        </section>
        <div className="sheet-action-bar">
          <SubmitButton type="submit" className="w-full" pendingText="Creando...">
            Crear banco
          </SubmitButton>
        </div>
      </form>
    </ResourceSheet>
  );

  return (
    <KineticPage className="space-y-5">
      <ScreenHeader title="Bancos" action={createBank} />
      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />
      <GroupedSection>
        {banks.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="Todavía no hay bancos"
            description="Agregá bancos o billeteras para asociarlos a tus medios de pago."
            compact
            className="m-4"
          />
        ) : (
          <div>
            {banks.map((bank) => (
              <ResourceSheet
                key={bank.id}
                title={bank.name}
                headerAction={
                  <ConfirmForm action={deleteBankAction} confirm={`¿Borrar “${bank.name}”?`}>
                    <input type="hidden" name="id" value={bank.id} />
                    <Button type="submit" variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Borrar banco">
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </ConfirmForm>
                }
                trigger={
                  <ResourceRowShell
                    icon={
                      <span className="grid size-full place-items-center rounded-[0.85rem] text-[0.82rem] font-bold text-white" style={{ background: bank.color }}>
                        {initials(bank.name)}
                      </span>
                    }
                    title={bank.name}
                    meta={`${bank.paymentMethods.length} medios asociados`}
                  />
                }
              >
                <form action={saveBankAction} className="space-y-4">
                  <input type="hidden" name="id" value={bank.id} />
                  <section className="grouped-form-section space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`bank-${bank.id}`}>Nombre</Label>
                      <Input id={`bank-${bank.id}`} name="name" defaultValue={bank.name} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`bank-color-${bank.id}`}>Color</Label>
                      <Input id={`bank-color-${bank.id}`} name="color" defaultValue={bank.color} />
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
    </KineticPage>
  );
}
