import { deleteCategoryAction, saveCategoryAction } from "@/app/actions/resources";
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

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
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
        title="Categorias"
        description="Podes crear, renombrar, desactivar o borrar las categorias que todavia no esten en uso."
      />

      <FlashMessage message={params.error} tone="error" />

      <CrudLayout>
        <CardPage>
          <CardHeader className="pb-2">
            <p className="stat-label">Catalogo</p>
            <CardTitle className="section-title">Categorias del hogar</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <EmptyState
                title="Todavia no hay categorias"
                description="Crea tu primera categoria con el formulario de la derecha."
                compact
              />
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
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {category.isActive ? "Activa" : "Inactiva"}
                        </TableCell>
                        <TableCell>
                          <form action={saveCategoryAction} className="inline-form">
                            <input type="hidden" name="id" value={category.id} />
                            <Input
                              name="name"
                              defaultValue={category.name}
                              aria-label={`Nombre ${category.name}`}
                              className="h-10 w-[220px]"
                            />
                            <CheckboxLine name="isActive" defaultChecked={category.isActive} className="text-xs">
                              Activa
                            </CheckboxLine>
                            <Button type="submit" variant="secondary" size="sm">
                              Guardar
                            </Button>
                          </form>
                        </TableCell>
                        <TableCell>
                          <form action={deleteCategoryAction}>
                            <input type="hidden" name="id" value={category.id} />
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
            <CardTitle className="section-title">Nueva categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={saveCategoryAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" placeholder="Ej. Colegio" required />
              </div>
              <CheckboxLine name="isActive" defaultChecked>
                Dejar activa
              </CheckboxLine>
              <Button type="submit" className="w-full">
                Crear categoria
              </Button>
            </form>
          </CardContent>
        </CardPage>
      </CrudLayout>
    </div>
  );
}
