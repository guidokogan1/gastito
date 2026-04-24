import { deleteCategoryAction, saveCategoryAction } from "@/app/actions/resources";
import { Tags } from "lucide-react";
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
    <div className="space-y-8">
      <PageHeader
        title="Categorías"
        description="Podés crear, renombrar, desactivar o borrar las categorías que todavía no estén en uso."
      />

      <FlashMessage message={params.error} tone="error" />
      <FlashMessage message={params.message} tone="success" />

      <CrudLayout>
        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Catálogo</p>
            <CardTitle className="section-title">Categorías del hogar</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <EmptyState
                icon={Tags}
                title="Todavía no hay categorías"
                description="Creá tu primera categoría con el formulario de la derecha."
                compact
              />
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
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {category.isActive ? "Activa" : "Inactiva"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
                            <form action={saveCategoryAction} className="inline-form justify-end">
                              <input type="hidden" name="id" value={category.id} />
                              <Input
                                name="name"
                                defaultValue={category.name}
                                aria-label={`Nombre ${category.name}`}
                                className="h-10 w-full min-w-[180px] sm:w-[220px]"
                              />
                              <CheckboxLine name="isActive" defaultChecked={category.isActive} className="text-xs">
                                Activa
                              </CheckboxLine>
                              <SubmitButton type="submit" variant="secondary" size="sm" pendingText="Guardando...">
                                Guardar
                              </SubmitButton>
                            </form>
                            <ConfirmForm
                              action={deleteCategoryAction}
                              confirm={`¿Borrar la categoría “${category.name}”? Esta acción no se puede deshacer.`}
                            >
                              <input type="hidden" name="id" value={category.id} />
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
            <CardTitle className="section-title">Nueva categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={saveCategoryAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" placeholder="Ej. Colegio" required autoFocus />
              </div>
              <CheckboxLine name="isActive" defaultChecked>
                Dejar activa
              </CheckboxLine>
              <SubmitButton type="submit" className="w-full" pendingText="Creando...">
                Crear categoría
              </SubmitButton>
            </form>
          </CardContent>
        </CardPage>
      </CrudLayout>
    </div>
  );
}
