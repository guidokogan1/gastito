"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Plus, SearchX } from "lucide-react";

import { formatArs, formatDate, moneyInputValue, toNumber } from "@/lib/format";
import { ConfirmForm } from "@/components/app/confirm-form";
import { SubmitButton } from "@/components/app/submit-button";
import { Slideout } from "@/components/app/slideout";
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

function toDetail(row: TransactionRow): string {
  return row.detail?.trim() || row.categoryName?.trim() || "Movimiento sin detalle";
}

export function TransactionsPanel({
  monthKey,
  transactions,
  accounts,
  categories,
  methods,
  saveAction,
  deleteAction,
}: {
  monthKey: string;
  transactions: TransactionRow[];
  accounts: SelectOption[];
  categories: SelectOption[];
  methods: SelectOption[];
  saveAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">("all");
  const [categoryFilterId, setCategoryFilterId] = useState<string>("all");
  const [methodFilterId, setMethodFilterId] = useState<string>("all");

  const selected = useMemo(
    () => (selectedId ? transactions.find((t) => t.id === selectedId) ?? null : null),
    [selectedId, transactions],
  );

  const filteredTransactions = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    return transactions.filter((row) => {
      if (typeFilter !== "all" && row.type !== typeFilter) return false;
      if (categoryFilterId !== "all" && (row.categoryId ?? "") !== categoryFilterId) return false;
      if (methodFilterId !== "all" && (row.paymentMethodId ?? "") !== methodFilterId) return false;
      if (!trimmedQuery) return true;

      const haystack = [
        toDetail(row),
        row.categoryName,
        row.accountName,
        row.paymentMethodName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(trimmedQuery);
    });
  }, [categoryFilterId, methodFilterId, query, transactions, typeFilter]);

  const formKey = selected?.id ?? "new";
  const panelTitle = selected ? "Editar movimiento" : "Nuevo movimiento";
  const panelSubtitle = selected
    ? "Ajustá fecha, monto, tipo y categorías. Guardá para aplicar cambios."
    : "Cargá un ingreso o gasto. Todo queda dentro de tu hogar.";

  const metrics = useMemo(() => {
    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + toNumber(t.amount), 0);
    const incomes = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + toNumber(t.amount), 0);
    return {
      expenses,
      incomes,
      balance: incomes - expenses,
    };
  }, [filteredTransactions]);

  const monthLabel = useMemo(() => {
    const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
    if (!match) return monthKey;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
    return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
  }, [monthKey]);

  return (
    <div className="space-y-6">
      <CardPage>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="stat-label">Movimientos · {monthLabel}</p>
              <CardTitle className="section-title">Gastos, ingresos y balance</CardTitle>
            </div>
            <Button
              type="button"
              onClick={() => {
                setSelectedId(null);
                setDrawerOpen(true);
              }}
            >
              <Plus className="size-4" aria-hidden />
              Nuevo movimiento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <EmptyState
              icon={ArrowRightLeft}
              title="Todavía no cargaste movimientos"
              description="Empezá cargando el primero."
              compact
            >
              <Button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setDrawerOpen(true);
                }}
              >
                <Plus className="size-4" aria-hidden />
                Cargar el primero
              </Button>
            </EmptyState>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-card/30 px-4 py-3">
                  <p className="stat-label">Gastos del mes</p>
                  <p className="mt-1 text-[1.35rem] font-semibold tabular-nums">{formatArs(metrics.expenses)}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/30 px-4 py-3">
                  <p className="stat-label">Ingresos del mes</p>
                  <p className="mt-1 text-[1.35rem] font-semibold tabular-nums">{formatArs(metrics.incomes)}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/30 px-4 py-3">
                  <p className="stat-label">Balance</p>
                  <p className="mt-1 text-[1.35rem] font-semibold tabular-nums">{formatArs(metrics.balance)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="tx-search">Buscar</Label>
                  <Input
                    id="tx-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Detalle, categoría, cuenta o medio…"
                  />
                </div>
                <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-type">Tipo</Label>
                    <NativeSelect
                      id="tx-type"
                      value={typeFilter}
                      onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
                    >
                      <option value="all">Todos</option>
                      <option value="expense">Gastos</option>
                      <option value="income">Ingresos</option>
                    </NativeSelect>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-category">Categoría</Label>
                    <NativeSelect
                      id="tx-category"
                      value={categoryFilterId}
                      onChange={(event) => setCategoryFilterId(event.target.value)}
                    >
                      <option value="all">Todas</option>
                      <option value="">Sin categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-method">Medio</Label>
                    <NativeSelect
                      id="tx-method"
                      value={methodFilterId}
                      onChange={(event) => setMethodFilterId(event.target.value)}
                    >
                      <option value="all">Todos</option>
                      <option value="">Sin medio</option>
                      {methods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Mostrando {filteredTransactions.length} de {transactions.length}.
              </p>

              {filteredTransactions.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="No encontramos movimientos con ese filtro"
                  description="Probá cambiando el texto de búsqueda o el tipo."
                  compact
                >
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setQuery("");
                      setTypeFilter("all");
                      setCategoryFilterId("all");
                      setMethodFilterId("all");
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </EmptyState>
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
                      {filteredTransactions.map((row) => {
                        const active = drawerOpen && row.id === selectedId;
                        return (
                          <TableRow key={row.id} className={cn(active ? "bg-muted/40" : "")}>
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
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedId(row.id);
                                    setDrawerOpen(true);
                                  }}
                                >
                                  Editar
                                </Button>
                                <ConfirmForm
                                  action={deleteAction}
                                  confirm="¿Borrar este movimiento? Esta acción no se puede deshacer."
                                >
                                  <input type="hidden" name="id" value={row.id} />
                                  <SubmitButton variant="destructive" size="sm" pendingText="Borrando...">
                                    Borrar
                                  </SubmitButton>
                                </ConfirmForm>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>
          )}
        </CardContent>
      </CardPage>

      <Slideout
        open={drawerOpen}
        title={selected ? "Edición" : "Nuevo"}
        description={panelTitle}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedId(null);
        }}
      >
        <div className="rounded-2xl border border-border/70 bg-card/30 p-4">
          <p className="text-sm text-muted-foreground">{panelSubtitle}</p>
        </div>

        <form key={formKey} action={saveAction} className="mt-4 space-y-3">
          {selected ? <input type="hidden" name="id" value={selected.id} /> : null}

          <div className="space-y-1.5">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              autoFocus
              defaultValue={(selected?.date ?? new Date()).toISOString().slice(0, 10)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
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
            <Label htmlFor="categoryId">Categoría</Label>
            <NativeSelect id="categoryId" name="categoryId" defaultValue={selected?.categoryId ?? ""}>
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paymentMethodId">Medio de pago</Label>
            <NativeSelect id="paymentMethodId" name="paymentMethodId" defaultValue={selected?.paymentMethodId ?? ""}>
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
            <Input id="detail" name="detail" placeholder="Ej. Compra semanal" defaultValue={selected?.detail ?? ""} />
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <SubmitButton type="submit" className="w-full sm:w-auto" pendingText="Guardando...">
              {selected ? "Guardar cambios" : "Guardar movimiento"}
            </SubmitButton>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setDrawerOpen(false);
                setSelectedId(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Slideout>
    </div>
  );
}
