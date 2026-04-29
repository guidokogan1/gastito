"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  Check,
  ChevronRight,
  CreditCard,
  Dumbbell,
  Filter,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  PawPrint,
  Plus,
  ReceiptText,
  Search,
  SearchX,
  ShoppingCart,
  Sparkles,
  Trash2,
  Utensils,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import { formatArs, moneyInputValue, toNumber } from "@/lib/format";
import { FinanceList, FinanceRow } from "@/components/app/finance-list";
import { ConfirmForm } from "@/components/app/confirm-form";
import { KineticCard, KineticPage } from "@/components/app/kinetic";
import { SubmitButton } from "@/components/app/submit-button";
import { Slideout } from "@/components/app/slideout";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PillChip } from "@/components/app/pill-chip";
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

function getCategoryIcon(name?: string | null, type: "expense" | "income" = "expense"): LucideIcon {
  const normalized = (name ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  if (type === "income") return ArrowDownLeft;
  if (normalized.includes("comida") || normalized.includes("super")) return Utensils;
  if (normalized.includes("educ")) return GraduationCap;
  if (normalized.includes("hogar")) return Home;
  if (normalized.includes("impuesto")) return ReceiptText;
  if (normalized.includes("masc")) return PawPrint;
  if (normalized.includes("ocio")) return Gamepad2;
  if (normalized.includes("regalo")) return Gift;
  if (normalized.includes("salud")) return HeartPulse;
  if (normalized.includes("servicio") || normalized.includes("internet")) return Wifi;
  if (normalized.includes("transporte")) return Car;
  if (normalized.includes("deporte")) return Dumbbell;
  if (normalized.includes("otros")) return Sparkles;
  return ShoppingCart;
}

function formatGroupDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

function SelectableSection({
  title,
  value,
  options,
  onValueChange,
}: {
  title: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[1.05rem] font-semibold tracking-[-0.02em]">{title}</p>
        <p className="text-xs text-muted-foreground">
          {options.find((option) => option.value === value)?.label ?? "Todas"}
        </p>
      </div>
      <div className="divide-y divide-border/60">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={`${title}-${option.value || option.label}`}
              type="button"
              className={cn(
                "pressed-scale focus-hairline flex min-h-13 w-full items-center justify-between gap-3 py-3 text-left text-[1.02rem] font-semibold transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
              onClick={() => onValueChange(option.value)}
            >
              <span className="truncate">{option.label}</span>
              {active ? <Check className="size-4 shrink-0 text-[var(--finance-green)]" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PickerOptionList({
  value,
  options,
  onValueChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar…"
          className="focus-hairline h-12 rounded-full pl-11"
          autoFocus
        />
      </div>
      <div className="space-y-1">
        {filtered.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={`picker-${option.value || option.label}`}
              type="button"
              className={cn(
                "selectable-row rounded-[1.05rem] px-3",
                active ? "bg-[var(--surface-pill)] text-foreground" : "text-muted-foreground",
              )}
              onClick={() => onValueChange(option.value)}
            >
              <span className="truncate">{option.label}</span>
              {active ? <Check className="size-4 shrink-0 text-[var(--finance-green)]" aria-hidden /> : null}
            </button>
          );
        })}
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm font-medium text-muted-foreground">
            Sin resultados
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SettingPickerRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="pressed-scale focus-hairline flex min-h-[4.6rem] w-full items-center justify-between gap-3 py-3 text-left"
      onClick={onClick}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--surface-pill)] text-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-muted-foreground">{label}</span>
          <span className="block truncate text-[1.08rem] font-semibold text-foreground">{value}</span>
        </span>
      </span>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
    </button>
  );
}

export function TransactionsPanel({
  monthKey,
  monthControl,
  transactions,
  accounts,
  categories,
  methods,
  saveAction,
  deleteAction,
}: {
  monthKey: string;
  monthControl: ReactNode;
  transactions: TransactionRow[];
  accounts: SelectOption[];
  categories: SelectOption[];
  methods: SelectOption[];
  saveAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<"category" | "method" | "account" | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, typeof filteredTransactions>();
    for (const row of filteredTransactions) {
      const key = formatGroupDate(row.date);
      const current = groups.get(key) ?? [];
      current.push(row);
      groups.set(key, current);
    }
    return [...groups.entries()];
  }, [filteredTransactions]);

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) +
    (categoryFilterId !== "all" ? 1 : 0) +
    (methodFilterId !== "all" ? 1 : 0);

  const monthLabel = useMemo(() => {
    const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
    if (!match) return monthKey;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
    const raw = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
    const withoutDe = raw.replace(/\s+de\s+/i, " ");
    return withoutDe.charAt(0).toUpperCase() + withoutDe.slice(1);
  }, [monthKey]);

  return (
    <KineticPage className="space-y-5">
      <KineticCard>
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">{monthControl}</div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Abrir filtros"
                className="icon-action"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter className="size-5" aria-hidden />
                {activeFilterCount > 0 ? (
                  <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-[var(--finance-green)] text-[0.62rem] font-bold text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
              <Button
                type="button"
                size="icon"
                aria-label="Nuevo movimiento"
                className="icon-action bg-[var(--finance-green)] text-white"
                onClick={() => {
                  setSelectedId(null);
                  setDrawerOpen(true);
                }}
              >
                <Plus className="size-5" aria-hidden />
              </Button>
            </div>
          </div>
          <div>
            {transactions.length === 0 ? (
              <EmptyState
                icon={ArrowUpRight}
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
                <div className="finance-summary-strip">
                  <div className="finance-summary-cell">
                    <p className="stat-label">Gastos</p>
                    <p className="money-row mt-1 text-foreground">
                      {formatArs(metrics.expenses)}
                    </p>
                  </div>
                  <div className="finance-summary-cell">
                    <p className="stat-label">Ingresos</p>
                    <p className="money-row mt-1 text-emerald-700 dark:text-emerald-300">
                      {formatArs(metrics.incomes)}
                    </p>
                  </div>
                  <div className="finance-summary-cell">
                    <p className="stat-label">Balance</p>
                    <p
                      className={cn(
                        "money-row mt-1",
                        metrics.balance < 0 ? "text-foreground" : "text-emerald-700 dark:text-emerald-300",
                      )}
                    >
                      {formatArs(metrics.balance)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <Input
                      id="tx-search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar movimiento"
                      className="h-13 rounded-[1.25rem] pl-11 text-[1.05rem]"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="mobile-scroll-row">
                      <button type="button" className="pressable" onClick={() => setTypeFilter("all")}>
                        <PillChip active={typeFilter === "all"}>Todos</PillChip>
                      </button>
                      <button type="button" className="pressable" onClick={() => setTypeFilter("expense")}>
                        <PillChip active={typeFilter === "expense"}>Gastos</PillChip>
                      </button>
                      <button type="button" className="pressable" onClick={() => setTypeFilter("income")}>
                        <PillChip active={typeFilter === "income"}>Ingresos</PillChip>
                      </button>
                      <button type="button" className="pressable" onClick={() => setFiltersOpen(true)}>
                        <PillChip icon={Filter} active={activeFilterCount > 0} count={activeFilterCount}>
                          Filtros
                        </PillChip>
                      </button>
                    </div>
                  </div>
                </div>

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
                  <div className="space-y-5">
                    {groupedTransactions.map(([dateLabel, rows]) => (
                      <section key={dateLabel} className="space-y-2">
                        <h3 className="px-1 text-[0.82rem] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                          {dateLabel}
                        </h3>
                        <FinanceList>
                        {rows.map((row) => {
                          const active = drawerOpen && row.id === selectedId;
                          return (
                            <button
                              key={row.id}
                              type="button"
                              className="block w-full text-left"
                              aria-label={`Editar ${toDetail(row)}`}
                              onClick={() => {
                                setSelectedId(row.id);
                                setDrawerOpen(true);
                              }}
                            >
                              <FinanceRow
                                icon={getCategoryIcon(row.categoryName, row.type)}
                                title={toDetail(row)}
                                meta={row.categoryName ?? row.paymentMethodName ?? row.accountName ?? undefined}
                                amount={
                                  <span className="inline-flex items-center gap-2">
                                    {formatArs(row.amount)}
                                    <ChevronRight className="size-4 opacity-45" aria-hidden />
                                  </span>
                                }
                                direction={row.type === "income" ? "income" : "expense"}
                                status={row.type === "income" ? "Ingreso" : undefined}
                                active={active}
                              />
                            </button>
                          );
                        })}
                      </FinanceList>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        </section>
      </KineticCard>

      <Slideout
        open={filtersOpen}
        title="Filtros"
        description="Ajustá la vista sin cambiar tus datos."
        onClose={() => setFiltersOpen(false)}
      >
        <div className="space-y-6">
          <section className="grouped-form-section space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Tipo</p>
              {typeFilter !== "all" ? <p className="text-xs text-muted-foreground">1 activo</p> : null}
            </div>
            <div className="mobile-scroll-row">
              <button type="button" className="pressable" onClick={() => setTypeFilter("all")}>
                <PillChip active={typeFilter === "all"}>Todos</PillChip>
              </button>
              <button type="button" className="pressable" onClick={() => setTypeFilter("expense")}>
                <PillChip active={typeFilter === "expense"}>Gastos</PillChip>
              </button>
              <button type="button" className="pressable" onClick={() => setTypeFilter("income")}>
                <PillChip active={typeFilter === "income"}>Ingresos</PillChip>
              </button>
            </div>
          </section>

          <section className="grouped-form-section space-y-5">
            <SelectableSection
              title="Categoría"
              value={categoryFilterId}
              onValueChange={(value) => setCategoryFilterId(value)}
              options={[
                { value: "all", label: "Todas" },
                { value: "none", label: "Sin categoría" },
                ...categories.map((category) => ({ value: category.id, label: category.name })),
              ]}
            />

            <SelectableSection
              title="Medio de pago"
              value={methodFilterId}
              onValueChange={(value) => setMethodFilterId(value)}
              options={[
                { value: "all", label: "Todos" },
                { value: "none", label: "Sin medio" },
                ...methods.map((method) => ({ value: method.id, label: method.name })),
              ]}
            />
          </section>

          <div className="sheet-action-bar">
            <div className="flex flex-col gap-2">
              <Button type="button" className="w-full" onClick={() => setFiltersOpen(false)}>
                Ver resultados
              </Button>
              {activeFilterCount > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setQuery("");
                    setTypeFilter("all");
                    setCategoryFilterId("all");
                    setMethodFilterId("all");
                  }}
                >
                  Limpiar filtros ({activeFilterCount})
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Slideout>

      <Slideout
        open={drawerOpen}
        title={panelTitle}
        description={selected ? undefined : `Cargar ${monthLabel}`}
        titleSize="small"
        headerAction={
          selected ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteConfirmOpen(true)}
              aria-label="Borrar movimiento"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          ) : null
        }
        onClose={() => {
          setDrawerOpen(false);
          setSelectedId(null);
        }}
      >
        {!selected ? (
          <div className="border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">{panelSubtitle}</p>
          </div>
        ) : null}

        <form key={formKey} action={saveAction} className="mt-4 space-y-5">
          {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
          <input type="hidden" name="type" value={formType} />
          <input type="hidden" name="date" value={formDate} />
          <input type="hidden" name="categoryId" value={formCategoryId} />
          <input type="hidden" name="paymentMethodId" value={formPaymentMethodId} />
          <input type="hidden" name="accountId" value={formAccountId} />

          <section className="grouped-form-section space-y-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Datos</p>
              <p className="text-xs text-muted-foreground">{selected ? "Editando" : "Nuevo"}</p>
            </div>
            <div className="space-y-2 text-center">
              <Label htmlFor="amount" className="sr-only">Monto</Label>
              <Input
                id="amount"
                name="amount"
                type="text"
                inputMode="decimal"
                required
                placeholder="0"
                defaultValue={selected ? moneyInputValue(selected.amount) : ""}
                className="h-20 appearance-none border-0 bg-transparent px-0 text-center text-[clamp(3.4rem,18vw,4.55rem)] font-semibold leading-none tracking-[-0.075em] shadow-none focus-visible:bg-transparent focus-visible:ring-0"
              />
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
                  className="h-9 rounded-full"
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
                  className="h-9 rounded-full"
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
              <Label htmlFor="detail">Detalle</Label>
              <Input id="detail" name="detail" placeholder="Ej. Compra semanal" defaultValue={selected?.detail ?? ""} />
            </div>
          </section>

          <section className="grouped-form-section space-y-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Etiquetas</p>
              <p className="text-xs text-muted-foreground">Opcional</p>
            </div>
            <div className="divide-y divide-border/60">
              <SettingPickerRow
                icon={getCategoryIcon(selectedCategoryName, formType)}
                label="Categoría"
                value={selectedCategoryName ?? "Sin categoría"}
                onClick={() => setPickerOpen("category")}
              />
              <SettingPickerRow
                icon={CreditCard}
                label="Medio de pago"
                value={selectedMethodName ?? "Sin medio"}
                onClick={() => setPickerOpen("method")}
              />
              <SettingPickerRow
                icon={Landmark}
                label="Cuenta"
                value={selectedAccountName ?? "Sin cuenta"}
                onClick={() => setPickerOpen("account")}
              />
            </div>
          </section>

          <div className="sheet-action-bar">
            <div className="flex flex-col gap-1.5">
              <SubmitButton type="submit" className="w-full" pendingText="Guardando...">
                {selected ? "Guardar cambios" : "Guardar movimiento"}
              </SubmitButton>
              <Button
                type="button"
                variant="ghost"
                className="h-11 w-full text-muted-foreground"
                onClick={() => {
                  setDrawerOpen(false);
                  setSelectedId(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </form>

      </Slideout>

      <Slideout
        open={deleteConfirmOpen}
        title="Borrar movimiento"
        description="Esta acción no se puede deshacer."
        onClose={() => setDeleteConfirmOpen(false)}
      >
        {selected ? (
          <div className="space-y-5">
            <div className="rounded-[1.25rem] bg-destructive/6 p-4 text-sm font-medium text-muted-foreground">
              Se va a borrar “{toDetail(selected)}” de forma permanente.
            </div>
            <div className="sheet-action-bar">
              <div className="flex flex-col gap-2">
                <ConfirmForm action={deleteAction} confirm="¿Borrar este movimiento? Esta acción no se puede deshacer.">
                  <input type="hidden" name="id" value={selected.id} />
                  <SubmitButton variant="destructive" className="w-full" pendingText="Borrando...">
                    Borrar
                  </SubmitButton>
                </ConfirmForm>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setDeleteConfirmOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Slideout>

      <Slideout
        open={pickerOpen !== null}
        title={
          pickerOpen === "category"
            ? "Categoría"
            : pickerOpen === "method"
              ? "Medio de pago"
              : "Cuenta"
        }
        description="Elegí una opción para el movimiento."
        onClose={() => setPickerOpen(null)}
      >
        {pickerOpen === "category" ? (
          <PickerOptionList
            value={formCategoryId}
            options={[
              { value: "", label: "Sin categoría" },
              ...categories.map((category) => ({ value: category.id, label: category.name })),
            ]}
            onValueChange={(value) => {
              setFormCategoryId(value);
              setPickerOpen(null);
            }}
          />
        ) : null}
        {pickerOpen === "method" ? (
          <PickerOptionList
            value={formPaymentMethodId}
            options={[
              { value: "", label: "Sin medio" },
              ...methods.map((method) => ({ value: method.id, label: method.name })),
            ]}
            onValueChange={(value) => {
              setFormPaymentMethodId(value);
              setPickerOpen(null);
            }}
          />
        ) : null}
        {pickerOpen === "account" ? (
          <PickerOptionList
            value={formAccountId}
            options={[
              { value: "", label: "Sin cuenta" },
              ...accounts.map((account) => ({ value: account.id, label: account.name })),
            ]}
            onValueChange={(value) => {
              setFormAccountId(value);
              setPickerOpen(null);
            }}
          />
        ) : null}
      </Slideout>
    </KineticPage>
  );
}
