import { deletePaymentMethodAction, savePaymentMethodAction } from "@/app/actions/resources";
import { CreditCard } from "lucide-react";
import { FlashMessage } from "@/components/flash-message";
import { ConfirmForm } from "@/components/app/confirm-form";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { CrudLayout } from "@/components/app/crud-layout";
import { SubmitButton } from "@/components/app/submit-button";
import { CheckboxLine } from "@/components/ui/checkbox-line";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="space-y-8">
      <PageHeader
        title="Medios de pago"
        description="Cada familia puede tener sus propios medios sin compartirlos con otras."
      />

      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      <CrudLayout>
        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Catálogo</p>
            <CardTitle className="section-title">Medios del hogar</CardTitle>
          </CardHeader>
          <CardContent>
            {methods.length === 0 ? (
              <EmptyState icon={CreditCard} title="Todavía no hay medios" description="Creá el primero a la derecha." compact />
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {methods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell className="text-muted-foreground">{method.isActive ? "Activo" : "Inactivo"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
                            <form action={savePaymentMethodAction} className="inline-form justify-end">
                              <input type="hidden" name="id" value={method.id} />
                              <Input
                                name="name"
                                defaultValue={method.name}
                                aria-label={`Nombre ${method.name}`}
                                className="h-10 w-full min-w-[200px] sm:w-[260px]"
                              />
                              <CheckboxLine name="isActive" defaultChecked={method.isActive} className="text-xs">
                                Activo
                              </CheckboxLine>
                              <SubmitButton type="submit" variant="secondary" size="sm" pendingText="Guardando...">
                                Guardar
                              </SubmitButton>
                            </form>
                            <ConfirmForm
                              action={deletePaymentMethodAction}
                              confirm={`¿Borrar el medio “${method.name}”? Esta acción no se puede deshacer.`}
                            >
                              <input type="hidden" name="id" value={method.id} />
                              <SubmitButton type="submit" variant="destructive" size="sm" pendingText="Borrando...">
                                Borrar
                              </SubmitButton>
                            </ConfirmForm>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </CardPage>

        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Nuevo</p>
            <CardTitle className="section-title">Nuevo medio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={savePaymentMethodAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" placeholder="Ej. Tarjeta Visa" required autoFocus />
              </div>
              <CheckboxLine name="isActive" defaultChecked>
                Dejar activo
              </CheckboxLine>
              <SubmitButton type="submit" className="w-full" pendingText="Creando...">
                Crear medio
              </SubmitButton>
            </form>
          </CardContent>
        </CardPage>
      </CrudLayout>
    </div>
  );
}
