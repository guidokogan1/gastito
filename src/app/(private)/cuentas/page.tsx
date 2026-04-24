import { deleteAccountAction, saveAccountAction } from "@/app/actions/resources";
import { Landmark } from "lucide-react";
import { FlashMessage } from "@/components/flash-message";
import { ConfirmForm } from "@/components/app/confirm-form";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { CrudLayout } from "@/components/app/crud-layout";
import { SubmitButton } from "@/components/app/submit-button";
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

const ACCOUNT_TYPE_LABEL = Object.fromEntries(
  ACCOUNT_TYPES.map((item) => [item.value, item.label] as const),
) as Record<(typeof ACCOUNT_TYPES)[number]["value"], string>;

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
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
        description="Podés usar cuentas de efectivo, banco o billetera virtual según tu hogar."
      />

      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      <CrudLayout>
        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Catálogo</p>
            <CardTitle className="section-title">Cuentas del hogar</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <EmptyState
                icon={Landmark}
                title="Todavía no hay cuentas"
                description="Creá la primera cuenta a la derecha."
                compact
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {ACCOUNT_TYPE_LABEL[account.type] ?? account.type}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
                            <form action={saveAccountAction} className="inline-form justify-end">
                              <input type="hidden" name="id" value={account.id} />
                              <Input name="name" defaultValue={account.name} className="h-10 w-full min-w-[180px] sm:w-[220px]" />
                              <NativeSelect
                                name="type"
                                defaultValue={account.type}
                                className="h-10 w-full min-w-[160px] sm:w-[180px]"
                                aria-label={`Tipo de la cuenta ${account.name}`}
                              >
                                {ACCOUNT_TYPES.map((t) => (
                                  <option key={t.value} value={t.value}>
                                    {t.label}
                                  </option>
                                ))}
                              </NativeSelect>
                              <CheckboxLine name="isActive" defaultChecked={account.isActive} className="text-xs">
                                Activa
                              </CheckboxLine>
                              <SubmitButton type="submit" variant="secondary" size="sm" pendingText="Guardando...">
                                Guardar
                              </SubmitButton>
                            </form>
                            <ConfirmForm
                              action={deleteAccountAction}
                              confirm={`¿Borrar la cuenta “${account.name}”? Esta acción no se puede deshacer.`}
                            >
                              <input type="hidden" name="id" value={account.id} />
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
            <p className="stat-label">Nueva</p>
            <CardTitle className="section-title">Nueva cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={saveAccountAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" placeholder="Ej. Cuenta sueldo" required autoFocus />
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
              <SubmitButton type="submit" className="w-full" pendingText="Creando...">
                Crear cuenta
              </SubmitButton>
            </form>
          </CardContent>
        </CardPage>
      </CrudLayout>
    </div>
  );
}
