import { deletePaymentMethodAction, savePaymentMethodAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { CrudLayout } from "@/components/app/crud-layout";
import { Button } from "@/components/ui/button";
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
  searchParams: Promise<{ error?: string }>;
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

      <CrudLayout>
        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Catalogo</p>
            <CardTitle className="section-title">Medios del hogar</CardTitle>
          </CardHeader>
          <CardContent>
            {methods.length === 0 ? (
              <EmptyState title="Todavia no hay medios" description="Crea el primero a la derecha." compact />
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Editar</TableHead>
                      <TableHead>Borrar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {methods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell className="text-muted-foreground">{method.isActive ? "Activo" : "Inactivo"}</TableCell>
                        <TableCell>
                          <form action={savePaymentMethodAction} className="inline-form">
                            <input type="hidden" name="id" value={method.id} />
                            <Input
                              name="name"
                              defaultValue={method.name}
                              aria-label={`Nombre ${method.name}`}
                              className="h-10 w-[260px]"
                            />
                            <CheckboxLine name="isActive" defaultChecked={method.isActive} className="text-xs">
                              Activo
                            </CheckboxLine>
                            <Button type="submit" variant="secondary" size="sm">
                              Guardar
                            </Button>
                          </form>
                        </TableCell>
                        <TableCell>
                          <form action={deletePaymentMethodAction}>
                            <input type="hidden" name="id" value={method.id} />
                            <Button type="submit" variant="destructive" size="sm">
                              Borrar
                            </Button>
                          </form>
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
                <Input id="name" name="name" placeholder="Ej. Tarjeta Visa" required />
              </div>
              <CheckboxLine name="isActive" defaultChecked>
                Dejar activo
              </CheckboxLine>
              <Button type="submit" className="w-full">
                Crear medio
              </Button>
            </form>
          </CardContent>
        </CardPage>
      </CrudLayout>
    </div>
  );
}
