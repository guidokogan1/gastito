import { deleteAccountAction, saveAccountAction } from "@/app/actions/resources";
import { FlashMessage } from "@/components/flash-message";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { CrudLayout } from "@/components/app/crud-layout";
import { Button } from "@/components/ui/button";
import { CheckboxLine } from "@/components/ui/checkbox-line";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
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

const ACCOUNT_TYPES = [
  { value: "cash", label: "Efectivo" },
  { value: "bank", label: "Banco" },
  { value: "wallet", label: "Billetera" },
] as const;

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { household } = await requireHousehold();
  const params = await searchParams;
  const accounts = await prisma.account.findMany({
    where: { householdId: household.id, deletedAt: null },
    select: { id: true, name: true, type: true, isActive: true },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cuentas"
        description="Podes usar cuentas de efectivo, banco o billetera virtual segun tu hogar."
      />

      <FlashMessage message={params.error} tone="error" />

      <CrudLayout>
        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Catalogo</p>
            <CardTitle className="section-title">Cuentas del hogar</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <EmptyState title="Todavia no hay cuentas" description="Crea la primera cuenta a la derecha." compact />
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Editar</TableHead>
                      <TableHead>Borrar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell className="text-muted-foreground">{account.type}</TableCell>
                        <TableCell>
                          <form action={saveAccountAction} className="inline-form">
                            <input type="hidden" name="id" value={account.id} />
                            <Input name="name" defaultValue={account.name} className="h-10 w-[220px]" />
                            <NativeSelect name="type" defaultValue={account.type} className="h-10 w-[180px]">
                              {ACCOUNT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </NativeSelect>
                            <CheckboxLine name="isActive" defaultChecked={account.isActive} className="text-xs">
                              Activa
                            </CheckboxLine>
                            <Button type="submit" variant="secondary" size="sm">
                              Guardar
                            </Button>
                          </form>
                        </TableCell>
                        <TableCell>
                          <form action={deleteAccountAction}>
                            <input type="hidden" name="id" value={account.id} />
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
            <p className="stat-label">Nueva</p>
            <CardTitle className="section-title">Nueva cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={saveAccountAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" placeholder="Ej. Cuenta sueldo" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Tipo</Label>
                <NativeSelect id="type" name="type" defaultValue="bank">
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <CheckboxLine name="isActive" defaultChecked>
                Dejar activa
              </CheckboxLine>
              <Button type="submit" className="w-full">
                Crear cuenta
              </Button>
            </form>
          </CardContent>
        </CardPage>
      </CrudLayout>
    </div>
  );
}
