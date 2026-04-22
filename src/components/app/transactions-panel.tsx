"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { formatArs, formatDate, moneyInputValue } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/app/empty-state";
import { cn } from "@/lib/utils";

type SelectOption = { id: string; name: string };

type MoneyLike = number | string | { toString(): string };

export type TransactionRow = {
  id: string;
  date: Date;
  amount: MoneyLike;
  type: "expense" | "income";
  detail: string | null;
  accountId: string | null;
  categoryId: string | null;
  paymentMethodId: string | null;
  accountName?: string | null;
  categoryName?: string | null;
  paymentMethodName?: string | null;
};

function SubmitButton({
  children,
  pendingText,
  ...props
}: React.ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} disabled={pending || props.disabled}>
      {pending ? pendingText ?? "Guardando..." : children}
    </Button>
  );
}

function toDetail(row: TransactionRow): string {
  return row.detail?.trim() || row.categoryName?.trim() || "Movimiento sin detalle";
}

export function TransactionsPanel({
  transactions,
  accounts,
  categories,
  methods,
  saveAction,
  deleteAction,
}: {
  transactions: TransactionRow[];
  accounts: SelectOption[];
  categories: SelectOption[];
  methods: SelectOption[];
  saveAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => (selectedId ? transactions.find((t) => t.id === selectedId) ?? null : null),
    [selectedId, transactions],
  );

  const formKey = selected?.id ?? "new";
  const panelTitle = selected ? "Editar movimiento" : "Nuevo movimiento";
  const panelSubtitle = selected
    ? "Ajustá fecha, monto, tipo y categorías. Guardá para aplicar cambios."
    : "Cargá un ingreso o gasto. Todo queda dentro de tu hogar.";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <CardPage>
        <CardHeader className="pb-2">
          <p className="stat-label">Listado</p>
          <CardTitle className="section-title">Ultimos movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <EmptyState
              title="Todavia no cargaste movimientos"
              description="Empeza con el panel de la derecha."
              compact
            />
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((row) => {
                    const active = row.id === selectedId;
                    return (
                      <TableRow
                        key={row.id}
                        className={cn(active ? "bg-muted/40" : "")}
                      >
                        <TableCell className="whitespace-nowrap">{formatDate(row.date)}</TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-medium">{toDetail(row)}</p>
                            <p className="text-xs text-muted-foreground">
                              {[row.accountName, row.paymentMethodName].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">{formatArs(row.amount)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.type === "income" ? "Ingreso" : "Gasto"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant={active ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => setSelectedId(active ? null : row.id)}
                            >
                              {active ? "Cerrar" : "Editar"}
                            </Button>
                            <form action={deleteAction}>
                              <input type="hidden" name="id" value={row.id} />
                              <SubmitButton variant="destructive" size="sm" pendingText="Borrando...">
                                Borrar
                              </SubmitButton>
                            </form>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </CardPage>

      <CardPage className="lg:sticky lg:top-6">
        <CardHeader className="pb-2">
          <p className="stat-label">{selected ? "Edicion" : "Nuevo"}</p>
          <CardTitle className="section-title">{panelTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{panelSubtitle}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <form key={formKey} action={saveAction} className="space-y-3">
            {selected ? <input type="hidden" name="id" value={selected.id} /> : null}

            <div className="space-y-1.5">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={(selected?.date ?? new Date()).toISOString().slice(0, 10)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                defaultValue={selected ? moneyInputValue(selected.amount) : ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">Tipo</Label>
              <NativeSelect id="type" name="type" defaultValue={selected?.type ?? "expense"}>
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accountId">Cuenta</Label>
              <NativeSelect id="accountId" name="accountId" defaultValue={selected?.accountId ?? ""}>
                <option value="">Sin cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Categoria</Label>
              <NativeSelect id="categoryId" name="categoryId" defaultValue={selected?.categoryId ?? ""}>
                <option value="">Sin categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentMethodId">Medio de pago</Label>
              <NativeSelect
                id="paymentMethodId"
                name="paymentMethodId"
                defaultValue={selected?.paymentMethodId ?? ""}
              >
                <option value="">Sin medio</option>
                {methods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="detail">Detalle</Label>
              <Input
                id="detail"
                name="detail"
                placeholder="Ej. Compra semanal"
                defaultValue={selected?.detail ?? ""}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <SubmitButton type="submit" className="w-full sm:w-auto">
                {selected ? "Guardar cambios" : "Guardar movimiento"}
              </SubmitButton>
              {selected ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setSelectedId(null)}
                >
                  Cancelar
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </CardPage>
    </div>
  );
}
