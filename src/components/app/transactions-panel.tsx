"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, ChevronRight, Plus, SearchX } from "lucide-react";

import { formatArs, formatDate, moneyInputValue, toNumber } from "@/lib/format";
import { ConfirmForm } from "@/components/app/confirm-form";
import { SubmitButton } from "@/components/app/submit-button";
import { Slideout } from "@/components/app/slideout";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchPicker } from "@/components/ui/search-picker";
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

function optionName(options: SelectOption[], id: string) {
  return options.find((o) => o.id === id)?.name ?? null;
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
  const [categoryFilterId, setCategoryFilterId] = useState<"all" | "none" | string>("all");
  const [methodFilterId, setMethodFilterId] = useState<"all" | "none" | string>("all");
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formPaymentMethodId, setFormPaymentMethodId] = useState<string>("");
  const [formAccountId, setFormAccountId] = useState<string>("");

  const selected = useMemo(
    () => (selectedId ? transactions.find((t) => t.id === selectedId) ?? null : null),
    [selectedId, transactions],
  );

  const filteredTransactions = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    return transactions.filter((row) => {
      if (typeFilter !== "all" && row.type !== typeFilter) return false;
      if (categoryFilterId !== "all") {
        const current = row.categoryId ?? "";
        if (categoryFilterId === "none") {
          if (current !== "") return false;
        } else if (current !== categoryFilterId) {
          return false;
        }
      }
      if (methodFilterId !== "all") {
        const current = row.paymentMethodId ?? "";
        if (methodFilterId === "none") {
          if (current !== "") return false;
        } else if (current !== methodFilterId) {
          return false;
        }
      }
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

  const quickPicks = useMemo(() => {
    const byTypeCategory = {
      expense: new Map<string, number>(),
      income: new Map<string, number>(),
    } as const;
    const byTypeMethod = {
      expense: new Map<string, number>(),
      income: new Map<string, number>(),
    } as const;

    for (const row of transactions) {
      const type = row.type;
      if (row.categoryId) {
        byTypeCategory[type].set(row.categoryId, (byTypeCategory[type].get(row.categoryId) ?? 0) + 1);
      }
      if (row.paymentMethodId) {
        byTypeMethod[type].set(row.paymentMethodId, (byTypeMethod[type].get(row.paymentMethodId) ?? 0) + 1);
      }
    }

    const rankByCount = (options: SelectOption[], counts: Map<string, number>, limit: number) => {
      const sorted = [...options]
        .map((o) => ({ ...o, count: counts.get(o.id) ?? 0 }))
        .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name, "es"));

      const picked = sorted.filter((o) => o.count > 0).slice(0, limit);
      if (picked.length < limit) {
        const pickedIds = new Set(picked.map((p) => p.id));
        const fill = sorted.filter((o) => !pickedIds.has(o.id)).slice(0, limit - picked.length);
        return [...picked, ...fill];
      }
      return picked;
    };

    return {
      expense: {
        categories: rankByCount(categories, byTypeCategory.expense, 8),
        methods: rankByCount(methods, byTypeMethod.expense, 6),
      },
      income: {
        categories: rankByCount(categories, byTypeCategory.income, 8),
        methods: rankByCount(methods, byTypeMethod.income, 6),
      },
    } as const;
  }, [categories, methods, transactions]);

  const quickCategories = quickPicks[formType].categories;
  const quickMethods = quickPicks[formType].methods;
  const selectedCategoryName = useMemo(
    () => (formCategoryId ? optionName(categories, formCategoryId) : null),
    [categories, formCategoryId],
  );
  const selectedMethodName = useMemo(
    () => (formPaymentMethodId ? optionName(methods, formPaymentMethodId) : null),
    [formPaymentMethodId, methods],
  );
  const selectedAccountName = useMemo(
    () => (formAccountId ? optionName(accounts, formAccountId) : null),
    [accounts, formAccountId],
  );

  const categoryPills = useMemo(() => {
    const base = quickCategories;
    if (!formCategoryId) return base;
    if (base.some((c) => c.id === formCategoryId)) return base;
    if (!selectedCategoryName) return base;
    return [{ id: formCategoryId, name: selectedCategoryName }, ...base].slice(0, 9);
  }, [formCategoryId, quickCategories, selectedCategoryName]);

  const methodPills = useMemo(() => {
    const base = quickMethods;
    if (!formPaymentMethodId) return base;
    if (base.some((m) => m.id === formPaymentMethodId)) return base;
    if (!selectedMethodName) return base;
    return [{ id: formPaymentMethodId, name: selectedMethodName }, ...base].slice(0, 7);
  }, [formPaymentMethodId, quickMethods, selectedMethodName]);

  useEffect(() => {
    if (!drawerOpen) return;
    setFormType((selected?.type ?? "expense") as "expense" | "income");
    setFormDate((selected?.date ?? new Date()).toISOString().slice(0, 10));
    setFormCategoryId(selected?.categoryId ?? "");
    setFormPaymentMethodId(selected?.paymentMethodId ?? "");
    setFormAccountId(selected?.accountId ?? "");
  }, [
    drawerOpen,
    selected?.accountId,
    selected?.categoryId,
    selected?.date,
    selected?.paymentMethodId,
    selected?.type,
  ]);

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
                  <p className="mt-1 text-[1.35rem] font-semibold tabular-nums text-foreground">
                    {formatArs(metrics.expenses)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/30 px-4 py-3">
                  <p className="stat-label">Ingresos del mes</p>
                  <p className="mt-1 text-[1.35rem] font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                    {formatArs(metrics.incomes)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/30 px-4 py-3">
                  <p className="stat-label">Balance</p>
                  <p
                    className={cn(
                      "mt-1 text-[1.35rem] font-semibold tabular-nums",
                      metrics.balance < 0 ? "text-destructive" : "text-emerald-700 dark:text-emerald-300",
                    )}
                  >
                    {formatArs(metrics.balance)}
                  </p>
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
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={typeFilter === "all" ? "default" : "outline"}
                        className={cn("h-9 rounded-full", typeFilter !== "all" && "bg-background")}
                        onClick={() => setTypeFilter("all")}
                      >
                        Todos
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={typeFilter === "expense" ? "default" : "outline"}
                        className={cn("h-9 rounded-full", typeFilter !== "expense" && "bg-background")}
                        onClick={() => setTypeFilter("expense")}
                      >
                        Gastos
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={typeFilter === "income" ? "default" : "outline"}
                        className={cn("h-9 rounded-full", typeFilter !== "income" && "bg-background")}
                        onClick={() => setTypeFilter("income")}
                      >
                        Ingresos
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tx-category">Categoría</Label>
                    <SearchPicker
                      value={categoryFilterId}
                      onValueChange={(value) => setCategoryFilterId(value as typeof categoryFilterId)}
                      placeholder="Todas"
                      inputPlaceholder="Buscar categoría…"
                      options={[
                        { value: "all", label: "Todas" },
                        { value: "none", label: "Sin categoría" },
                        ...categories.map((category) => ({ value: category.id, label: category.name })),
                      ]}
                      className="h-11 w-full justify-between rounded-xl text-sm"
                      contentClassName="w-[min(28rem,calc(100vw-2rem))]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tx-method">Medio</Label>
                    <SearchPicker
                      value={methodFilterId}
                      onValueChange={(value) => setMethodFilterId(value as typeof methodFilterId)}
                      placeholder="Todos"
                      inputPlaceholder="Buscar medio…"
                      options={[
                        { value: "all", label: "Todos" },
                        { value: "none", label: "Sin medio" },
                        ...methods.map((method) => ({ value: method.id, label: method.name })),
                      ]}
                      className="h-11 w-full justify-between rounded-xl text-sm"
                      contentClassName="w-[min(28rem,calc(100vw-2rem))]"
                    />
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
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((row) => {
                        const active = drawerOpen && row.id === selectedId;
                        return (
                          <TableRow
                            key={row.id}
                            className={cn(active ? "bg-muted/40" : "", "cursor-pointer")}
                            role="button"
                            tabIndex={0}
                            aria-label={`Editar ${toDetail(row)}`}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter" && event.key !== " ") return;
                              event.preventDefault();
                              setSelectedId(row.id);
                              setDrawerOpen(true);
                            }}
                            onClick={() => {
                              setSelectedId(row.id);
                              setDrawerOpen(true);
                            }}
                          >
                            <TableCell className="whitespace-nowrap">{formatDate(row.date)}</TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                <p className="font-medium">{toDetail(row)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {[row.categoryName, row.accountName, row.paymentMethodName].filter(Boolean).join(" · ")}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell
                              className={cn(
                                "whitespace-nowrap tabular-nums text-right",
                                row.type === "income" ? "text-emerald-700 dark:text-emerald-300" : "",
                              )}
                            >
                              {formatArs(row.amount)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <span
                                className={cn(
                                  "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium",
                                  row.type === "income"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                                    : "border-border/60 bg-background text-foreground",
                                )}
                              >
                                {row.type === "income" ? "Ingreso" : "Gasto"}
                              </span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right text-muted-foreground">
                              <ChevronRight className="ml-auto size-4 opacity-70" aria-hidden />
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
        title={panelTitle}
        description={selected ? "Actualizá y guardá" : `Cargar ${monthLabel}`}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedId(null);
        }}
      >
        <div className="rounded-2xl border border-border/70 bg-card/30 p-4">
          <p className="text-sm text-muted-foreground">{panelSubtitle}</p>
        </div>

        <form key={formKey} action={saveAction} className="mt-4 space-y-5">
          {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
          <input type="hidden" name="type" value={formType} />
          <input type="hidden" name="date" value={formDate} />
          <input type="hidden" name="categoryId" value={formCategoryId} />
          <input type="hidden" name="paymentMethodId" value={formPaymentMethodId} />
          <input type="hidden" name="accountId" value={formAccountId} />

          <section className="rounded-2xl border border-border/70 bg-card/30 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Datos</p>
              <p className="text-xs text-muted-foreground">{selected ? "Editando" : "Nuevo"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={formType === "expense" ? "default" : "outline"}
                size="sm"
                className={cn("h-9 rounded-full", formType !== "expense" && "bg-background")}
                onClick={() => setFormType("expense")}
              >
                Gasto
              </Button>
              <Button
                type="button"
                variant={formType === "income" ? "default" : "outline"}
                size="sm"
                className={cn("h-9 rounded-full", formType !== "income" && "bg-background")}
                onClick={() => setFormType("income")}
              >
                Ingreso
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-full bg-background"
                  onClick={() => {
                    const today = new Date();
                    const value = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                      .toISOString()
                      .slice(0, 10);
                    setFormDate(value);
                  }}
                >
                  Hoy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-full bg-background"
                  onClick={() => {
                    const today = new Date();
                    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
                    const value = yesterday.toISOString().slice(0, 10);
                    setFormDate(value);
                  }}
                >
                  Ayer
                </Button>
              </div>
              <DateField
                id="date"
                required
                value={formDate}
                onValueChange={setFormDate}
              />
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="detail">Detalle</Label>
              <Input id="detail" name="detail" placeholder="Ej. Compra semanal" defaultValue={selected?.detail ?? ""} />
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card/30 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Etiquetas</p>
              <p className="text-xs text-muted-foreground">Pills + búsqueda</p>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={formCategoryId === "" ? "default" : "outline"}
                  size="sm"
                  className={cn("rounded-full", formCategoryId !== "" && "bg-background")}
                  onClick={() => setFormCategoryId("")}
                >
                  Sin categoría
                </Button>
                {categoryPills.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={formCategoryId === category.id ? "default" : "outline"}
                    size="sm"
                    className={cn("rounded-full", formCategoryId !== category.id && "bg-background")}
                    onClick={() => setFormCategoryId(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
                {categories.length > categoryPills.length ? (
                  <SearchPicker
                    value={formCategoryId}
                    placeholder="Más…"
                    options={[...categories.map((category) => ({ value: category.id, label: category.name }))]}
                    onValueChange={setFormCategoryId}
                    showSelectedLabel={false}
                  />
                ) : null}
              </div>
              {formCategoryId && selectedCategoryName ? (
                <p className="text-xs text-muted-foreground">Seleccionada: {selectedCategoryName}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Medio de pago</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={formPaymentMethodId === "" ? "default" : "outline"}
                  size="sm"
                  className={cn("rounded-full", formPaymentMethodId !== "" && "bg-background")}
                  onClick={() => setFormPaymentMethodId("")}
                >
                  Sin medio
                </Button>
                {methodPills.map((method) => (
                  <Button
                    key={method.id}
                    type="button"
                    variant={formPaymentMethodId === method.id ? "default" : "outline"}
                    size="sm"
                    className={cn("rounded-full", formPaymentMethodId !== method.id && "bg-background")}
                    onClick={() => setFormPaymentMethodId(method.id)}
                  >
                    {method.name}
                  </Button>
                ))}
                {methods.length > methodPills.length ? (
                  <SearchPicker
                    value={formPaymentMethodId}
                    placeholder="Más…"
                    options={[...methods.map((method) => ({ value: method.id, label: method.name }))]}
                    onValueChange={setFormPaymentMethodId}
                    showSelectedLabel={false}
                  />
                ) : null}
              </div>
              {formPaymentMethodId && selectedMethodName ? (
                <p className="text-xs text-muted-foreground">Seleccionado: {selectedMethodName}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Cuenta (opcional)</Label>
              <SearchPicker
                value={formAccountId}
                placeholder="Sin cuenta"
                options={[
                  { value: "", label: "Sin cuenta" },
                  ...accounts.map((account) => ({ value: account.id, label: account.name })),
                ]}
                onValueChange={setFormAccountId}
                className="w-full justify-between rounded-2xl"
                contentClassName="w-[min(28rem,calc(100vw-2rem))]"
                side="top"
              />
              {formAccountId && selectedAccountName ? (
                <p className="text-xs text-muted-foreground">Cuenta: {selectedAccountName}</p>
              ) : null}
            </div>
          </section>

          <div className="sticky bottom-0 mt-6 -mx-4 border-t border-border/60 bg-background/85 px-4 py-4 backdrop-blur sm:-mx-5 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
          </div>

          {selected ? (
            <section className="mt-6 rounded-2xl border border-destructive/25 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">Zona peligrosa</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Borrar elimina el movimiento de forma permanente.
              </p>
              <div className="mt-3">
                <ConfirmForm action={deleteAction} confirm="¿Borrar este movimiento? Esta acción no se puede deshacer.">
                  <input type="hidden" name="id" value={selected.id} />
                  <SubmitButton variant="destructive" pendingText="Borrando...">
                    Borrar movimiento
                  </SubmitButton>
                </ConfirmForm>
              </div>
            </section>
          ) : null}
        </form>
      </Slideout>
    </div>
  );
}
