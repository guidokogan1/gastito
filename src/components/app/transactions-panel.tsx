"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CreditCard,
  Filter,
  Landmark,
  Plus,
  Search,
  SearchX,
  Trash2,
  SortAsc,
  type LucideIcon,
} from "lucide-react";

import { formatArs, moneyInputValue, toNumber } from "@/lib/format";
import { DEFAULT_INCOME_CATEGORIES } from "@/lib/catalog";
import { ConfirmForm } from "@/components/app/confirm-form";
import { KineticPage } from "@/components/app/kinetic";
import { SubmitButton } from "@/components/app/submit-button";
import { Slideout } from "@/components/app/slideout";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PillChip } from "@/components/app/pill-chip";
import { EmptyState } from "@/components/app/empty-state";
import { MoneyField } from "@/components/app/money-field";
import { MetricStrip } from "@/components/app/metric-strip";
import { SearchPill } from "@/components/app/search-pill";
import { SegmentedControl } from "@/components/app/segmented-control";
import { TransactionListRow, getTransactionCategoryIcon, normalizeCategoryLabel } from "@/components/app/transaction-list-row";
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

const INCOME_CATEGORY_NAMES = new Set(DEFAULT_INCOME_CATEGORIES.map((category) => normalizeCategoryLabel(category.name)));
const INCOME_CATEGORY_ORDER = new Map(
  DEFAULT_INCOME_CATEGORIES.map((category, index) => [normalizeCategoryLabel(category.name), index]),
);

function isIncomeCategoryName(name?: string | null) {
  return INCOME_CATEGORY_NAMES.has(normalizeCategoryLabel(name));
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
        <p className="text-[1.02rem] font-medium">{title}</p>
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
              aria-pressed={active}
              className={cn(
                "pressed-scale focus-hairline flex min-h-13 w-full items-center justify-between gap-3 py-3 text-left text-[1.02rem] font-medium transition-colors",
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
              aria-pressed={active}
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
      aria-haspopup="dialog"
      className="pressed-scale selectable-row focus-hairline flex min-h-[4.6rem] w-full items-center justify-between gap-3 rounded-[1rem] py-3 text-left"
      onClick={onClick}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--surface-pill)] text-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-muted-foreground">{label}</span>
          <span className="block truncate text-[1.06rem] font-medium text-foreground">{value}</span>
        </span>
      </span>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
    </button>
  );
}

function ActiveFilterPill({
  label,
  onClear,
}: {
  label: string;
  onClear?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-pill)] px-3 py-1.5 text-[0.8rem] font-medium text-foreground">
      {label}
      {onClear ? (
        <button
          type="button"
          className="text-muted-foreground transition-colors hover:text-foreground"
          onClick={onClear}
          aria-label={`Limpiar filtro ${label}`}
        >
          ×
        </button>
      ) : null}
    </span>
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
  initialComposeOpen = false,
  initialTransactionType = "expense",
  readOnly = false,
}: {
  monthKey: string;
  monthControl: ReactNode;
  transactions: TransactionRow[];
  accounts: SelectOption[];
  categories: SelectOption[];
  methods: SelectOption[];
  saveAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  initialComposeOpen?: boolean;
  initialTransactionType?: "expense" | "income";
  readOnly?: boolean;
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
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "7d" | "14d" | "30d">("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "amount-desc" | "amount-asc">("date-desc");
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formPaymentMethodId, setFormPaymentMethodId] = useState<string>("");
  const [formAccountId, setFormAccountId] = useState<string>("");
  const resetFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setCategoryFilterId("all");
    setMethodFilterId("all");
    setDateFilter("all");
  };

  useEffect(() => {
    if (readOnly || !initialComposeOpen) return;
    setSelectedId(null);
    setFormType(initialTransactionType);
    setDrawerOpen(true);
  }, [initialComposeOpen, initialTransactionType, readOnly]);

  useEffect(() => {
    const saved = window.localStorage.getItem("gastito.transactionFilters");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as {
        query?: string;
        typeFilter?: "all" | "expense" | "income";
        categoryFilterId?: "all" | "none" | string;
        methodFilterId?: "all" | "none" | string;
        dateFilter?: "all" | "today" | "7d" | "14d" | "30d" | "week";
        sortBy?: "date-desc" | "amount-desc" | "amount-asc";
      };
      setQuery(parsed.query ?? "");
      setTypeFilter(parsed.typeFilter ?? "all");
      setCategoryFilterId(parsed.categoryFilterId ?? "all");
      setMethodFilterId(parsed.methodFilterId ?? "all");
      setDateFilter(parsed.dateFilter === "week" ? "7d" : parsed.dateFilter ?? "all");
      setSortBy(parsed.sortBy ?? "date-desc");
    } catch {
      window.localStorage.removeItem("gastito.transactionFilters");
    }
    setFiltersHydrated(true);
  }, []);

  useEffect(() => {
    if (!filtersHydrated) return;
    window.localStorage.setItem(
      "gastito.transactionFilters",
      JSON.stringify({ query, typeFilter, categoryFilterId, methodFilterId, dateFilter, sortBy }),
    );
  }, [categoryFilterId, dateFilter, filtersHydrated, methodFilterId, query, sortBy, typeFilter]);

  const selected = useMemo(
    () => (selectedId ? transactions.find((t) => t.id === selectedId) ?? null : null),
    [selectedId, transactions],
  );

  const filteredTransactions = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    const amountQuery = Number(trimmedQuery.replace(/\./g, "").replace(",", "."));
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const sevenDaysStart = new Date(todayStart);
    sevenDaysStart.setDate(todayStart.getDate() - 6);
    const fourteenDaysStart = new Date(todayStart);
    fourteenDaysStart.setDate(todayStart.getDate() - 13);
    const thirtyDaysStart = new Date(todayStart);
    thirtyDaysStart.setDate(todayStart.getDate() - 29);
    const filtered = transactions.filter((row) => {
      if (typeFilter !== "all" && row.type !== typeFilter) return false;
      if (dateFilter === "today" && row.date < todayStart) return false;
      if (dateFilter === "7d" && row.date < sevenDaysStart) return false;
      if (dateFilter === "14d" && row.date < fourteenDaysStart) return false;
      if (dateFilter === "30d" && row.date < thirtyDaysStart) return false;
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
      if (Number.isFinite(amountQuery) && Math.round(toNumber(row.amount)) === Math.round(amountQuery)) return true;

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
    return [...filtered].sort((a, b) => {
      if (sortBy === "amount-desc") return toNumber(b.amount) - toNumber(a.amount);
      if (sortBy === "amount-asc") return toNumber(a.amount) - toNumber(b.amount);
      return b.date.getTime() - a.date.getTime();
    });
  }, [categoryFilterId, dateFilter, methodFilterId, query, sortBy, transactions, typeFilter]);

  const formKey = selected?.id ?? "new";
  const panelTitle = selected ? "Editar movimiento" : "Nuevo movimiento";

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

  const expenseCategories = useMemo(
    () => categories.filter((category) => !isIncomeCategoryName(category.name)),
    [categories],
  );
  const incomeCategories = useMemo(
    () =>
      categories
        .filter((category) => isIncomeCategoryName(category.name))
        .sort(
          (a, b) =>
            (INCOME_CATEGORY_ORDER.get(normalizeCategoryLabel(a.name)) ?? 99) -
            (INCOME_CATEGORY_ORDER.get(normalizeCategoryLabel(b.name)) ?? 99),
        ),
    [categories],
  );
  const formCategoryOptions = formType === "income" ? incomeCategories : expenseCategories;
  const filterCategoryOptions =
    typeFilter === "income" ? incomeCategories : typeFilter === "expense" ? expenseCategories : categories;
  const categoryLabel = formType === "income" ? "Categoría de ingreso" : "Categoría";
  const paymentMethodLabel = formType === "income" ? "Cómo entró" : "Medio de pago";
  const paymentMethodEmptyLabel = formType === "income" ? "Sin canal" : "Sin medio";
  const accountLabel = formType === "income" ? "A dónde llegó" : "Cuenta";

  useEffect(() => {
    if (!drawerOpen) return;
    setFormType((selected?.type ?? initialTransactionType) as "expense" | "income");
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
    initialTransactionType,
  ]);

  useEffect(() => {
    if (!formCategoryId) return;
    if (formCategoryOptions.some((category) => category.id === formCategoryId)) return;
    setFormCategoryId("");
  }, [formCategoryId, formCategoryOptions]);

  useEffect(() => {
    if (categoryFilterId === "all" || categoryFilterId === "none") return;
    if (filterCategoryOptions.some((category) => category.id === categoryFilterId)) return;
    setCategoryFilterId("all");
  }, [categoryFilterId, filterCategoryOptions]);

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
    (methodFilterId !== "all" ? 1 : 0) +
    (dateFilter !== "all" ? 1 : 0);
  const activeFilterLabels = [
    typeFilter !== "all" ? { label: typeFilter === "expense" ? "Solo gastos" : "Solo ingresos", onClear: () => setTypeFilter("all") } : null,
    dateFilter !== "all"
      ? {
          label:
            dateFilter === "today"
              ? "Hoy"
              : dateFilter === "7d"
                ? "7 dias"
                : dateFilter === "14d"
                  ? "14 dias"
                  : "30 dias",
          onClear: () => setDateFilter("all"),
        }
      : null,
    categoryFilterId !== "all"
      ? {
          label: categoryFilterId === "none" ? "Sin categoría" : `Categoría: ${filterCategoryOptions.find((category) => category.id === categoryFilterId)?.name ?? "Filtrada"}`,
          onClear: () => setCategoryFilterId("all"),
        }
      : null,
    methodFilterId !== "all"
      ? {
          label: methodFilterId === "none" ? "Sin medio" : `Medio: ${methods.find((method) => method.id === methodFilterId)?.name ?? "Filtrado"}`,
          onClear: () => setMethodFilterId("all"),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; onClear: () => void }>;
  const formContextSummary = [
    { label: formType === "income" ? "Tipo: ingreso" : "Tipo: gasto" },
    { label: selectedCategoryName ? `Categoría: ${selectedCategoryName}` : "Sin categoría" },
    { label: selectedMethodName ? `${paymentMethodLabel}: ${selectedMethodName}` : paymentMethodEmptyLabel },
    { label: selectedAccountName ? `${accountLabel}: ${selectedAccountName}` : "Sin cuenta" },
  ];

  return (
    <KineticPage className="space-y-5">
      <section className="space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">{monthControl}</div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Abrir filtros"
              className="icon-action size-10 text-muted-foreground"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="size-4.5" aria-hidden />
              {activeFilterCount > 0 ? (
                <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-[var(--finance-green)] text-[0.62rem] font-bold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
            {!readOnly ? (
              <Button
                type="button"
                size="icon"
                aria-label="Nuevo movimiento"
                className="icon-action size-10 bg-[var(--finance-green)] text-white"
                onClick={() => {
                  setSelectedId(null);
                  setDrawerOpen(true);
                }}
              >
                <Plus className="size-5" aria-hidden />
              </Button>
            ) : null}
          </div>
        </div>

        <h1 className="screen-title">
          Movimientos
        </h1>
      </section>

      <section className="space-y-7">
        {transactions.length === 0 ? (
          <EmptyState
            icon={ArrowUpRight}
            title="Todavía no cargaste movimientos"
            description="Empezá cargando el primero."
            compact
          >
            {!readOnly ? (
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
            ) : null}
          </EmptyState>
        ) : (
          <>
            <MetricStrip
              items={[
                { label: "Gastos", value: formatArs(metrics.expenses) },
                { label: "Ingresos", value: formatArs(metrics.incomes), tone: "income" },
                { label: "Balance", value: formatArs(metrics.balance), tone: metrics.balance >= 0 ? "income" : "default" },
              ]}
              className="gap-5"
            />

            <div className="flex flex-col gap-4">
              <SearchPill
                id="tx-search"
                value={query}
                placeholder="Buscar movimiento, categoría..."
                onValueChange={setQuery}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="pressable" aria-pressed={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
                  <PillChip variant="scope" active={typeFilter === "all"}>Todos</PillChip>
                </button>
                <button type="button" className="pressable" aria-pressed={typeFilter === "expense"} onClick={() => setTypeFilter("expense")}>
                  <PillChip variant="scope" active={typeFilter === "expense"}>Gastos</PillChip>
                </button>
                <button type="button" className="pressable" aria-pressed={typeFilter === "income"} onClick={() => setTypeFilter("income")}>
                  <PillChip variant="scope" active={typeFilter === "income"}>Ingresos</PillChip>
                </button>
              </div>
              <div className="mobile-scroll-row gap-2.5 pb-0.5">
                <button type="button" className="pressable" aria-pressed={dateFilter === "today"} onClick={() => setDateFilter(dateFilter === "today" ? "all" : "today")}>
                  <PillChip active={dateFilter === "today"}>Hoy</PillChip>
                </button>
                <button type="button" className="pressable" aria-pressed={dateFilter === "7d"} onClick={() => setDateFilter(dateFilter === "7d" ? "all" : "7d")}>
                  <PillChip active={dateFilter === "7d"} className="whitespace-nowrap">7 días</PillChip>
                </button>
                <button type="button" className="pressable" aria-pressed={dateFilter === "30d"} onClick={() => setDateFilter(dateFilter === "30d" ? "all" : "30d")}>
                  <PillChip active={dateFilter === "30d"} className="whitespace-nowrap">30 días</PillChip>
                </button>
              </div>
              {activeFilterLabels.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilterLabels.map((item) => (
                    <ActiveFilterPill key={item.label} label={item.label} onClear={item.onClear} />
                  ))}
                  <button
                    type="button"
                    className="text-[0.82rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={resetFilters}
                  >
                    Limpiar todo
                  </button>
                </div>
              ) : null}
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
                  onClick={resetFilters}
                >
                  Limpiar filtros
                </Button>
              </EmptyState>
            ) : (
              <div className="space-y-6">
                {groupedTransactions.map(([dateLabel, rows]) => {
                  const dayTotal = rows.reduce((acc, row) => acc + (row.type === "income" ? toNumber(row.amount) : -toNumber(row.amount)), 0);
                  return (
                    <section key={dateLabel} className="space-y-2.5">
                      <div className="flex items-center justify-between px-1 text-[0.75rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                        <h3>{dateLabel}</h3>
                        <p className="normal-case text-[0.82rem] font-normal tracking-normal text-muted-foreground">{formatArs(dayTotal)}</p>
                      </div>
                      <div className="app-list">
                        {rows.map((row) => {
                          const active = !readOnly && drawerOpen && row.id === selectedId;
                          if (readOnly) {
                            return (
                              <TransactionListRow
                                key={row.id}
                                title={toDetail(row)}
                                categoryName={row.categoryName}
                                amount={row.amount}
                                type={row.type}
                                active={false}
                              />
                            );
                          }
                          return (
                            <button
                              key={row.id}
                              type="button"
                              className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/18"
                              aria-label={`Editar ${toDetail(row)}`}
                              onClick={() => {
                                setSelectedId(row.id);
                                setDrawerOpen(true);
                              }}
                            >
                              <TransactionListRow
                                title={toDetail(row)}
                                categoryName={row.categoryName}
                                amount={row.amount}
                                type={row.type}
                                active={active}
                                interactive
                              />
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

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
              <button type="button" className="pressable" aria-pressed={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
                <PillChip active={typeFilter === "all"}>Todos</PillChip>
              </button>
              <button type="button" className="pressable" aria-pressed={typeFilter === "expense"} onClick={() => setTypeFilter("expense")}>
                <PillChip active={typeFilter === "expense"}>Gastos</PillChip>
              </button>
              <button type="button" className="pressable" aria-pressed={typeFilter === "income"} onClick={() => setTypeFilter("income")}>
                <PillChip active={typeFilter === "income"}>Ingresos</PillChip>
              </button>
            </div>
          </section>

          <section className="grouped-form-section space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Orden</p>
              <SortAsc className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <div className="mobile-scroll-row">
              <button type="button" className="pressable" aria-pressed={sortBy === "date-desc"} onClick={() => setSortBy("date-desc")}>
                <PillChip active={sortBy === "date-desc"}>Recientes</PillChip>
              </button>
              <button type="button" className="pressable" aria-pressed={sortBy === "amount-desc"} onClick={() => setSortBy("amount-desc")}>
                <PillChip active={sortBy === "amount-desc"}>Mayor valor</PillChip>
              </button>
              <button type="button" className="pressable" aria-pressed={sortBy === "amount-asc"} onClick={() => setSortBy("amount-asc")}>
                <PillChip active={sortBy === "amount-asc"}>Menor valor</PillChip>
              </button>
            </div>
          </section>

          <section className="grouped-form-section space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Fecha</p>
              {dateFilter !== "all" ? <p className="text-xs text-muted-foreground">1 activo</p> : null}
            </div>
            <div className="mobile-scroll-row">
              <button type="button" className="pressable" aria-pressed={dateFilter === "all"} onClick={() => setDateFilter("all")}>
                <PillChip active={dateFilter === "all"}>Todas</PillChip>
              </button>
              <button type="button" className="pressable" aria-pressed={dateFilter === "today"} onClick={() => setDateFilter("today")}>
                <PillChip active={dateFilter === "today"}>Hoy</PillChip>
              </button>
              <button type="button" className="pressable" aria-pressed={dateFilter === "7d"} onClick={() => setDateFilter("7d")}>
                <PillChip active={dateFilter === "7d"}>7 días</PillChip>
              </button>
              <button type="button" className="pressable" aria-pressed={dateFilter === "14d"} onClick={() => setDateFilter("14d")}>
                <PillChip active={dateFilter === "14d"}>14 días</PillChip>
              </button>
              <button type="button" className="pressable" aria-pressed={dateFilter === "30d"} onClick={() => setDateFilter("30d")}>
                <PillChip active={dateFilter === "30d"}>30 días</PillChip>
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
                ...filterCategoryOptions.map((category) => ({ value: category.id, label: category.name })),
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
                  onClick={resetFilters}
                >
                  Limpiar filtros ({activeFilterCount})
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Slideout>

      {!readOnly ? (
        <Slideout
          open={drawerOpen}
          title={panelTitle}
          description={selected ? "Ajustá el movimiento sin perder el contexto del mes y los filtros actuales." : "Cargá el movimiento con el menor esfuerzo posible. Lo demás lo podés completar después."}
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
          <form key={formKey} action={saveAction} className="mt-4 space-y-5">
          {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
          <input type="hidden" name="type" value={formType} />
          <input type="hidden" name="date" value={formDate} />
          <input type="hidden" name="categoryId" value={formCategoryId} />
          <input type="hidden" name="paymentMethodId" value={formPaymentMethodId} />
          <input type="hidden" name="accountId" value={formAccountId} />

          <section className="grouped-form-section space-y-5">
            <div className="rounded-[1.15rem] border border-border/70 bg-card px-4 py-3">
              <p className="text-[0.78rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">Contexto del movimiento</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {formContextSummary.map((item) => (
                  <ActiveFilterPill key={item.label} label={item.label} />
                ))}
              </div>
            </div>
            <div className="space-y-2 text-center">
              <MoneyField
                id="amount"
                name="amount"
                defaultValue={selected ? moneyInputValue(selected.amount) : ""}
                showPreview={false}
              />
            </div>
            <SegmentedControl
              value={formType}
              onValueChange={(nextValue) => setFormType(nextValue as "expense" | "income")}
              options={[
                { value: "expense", label: "Gasto" },
                { value: "income", label: "Ingreso" },
              ]}
              size="sm"
            />

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <DateField
                id="date"
                required
                value={formDate}
                onValueChange={setFormDate}
              />
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
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-full"
                  onClick={() => {
                    const today = new Date();
                    const twoDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2);
                    const value = twoDaysAgo.toISOString().slice(0, 10);
                    setFormDate(value);
                  }}
                >
                  Hace 2 días
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail">Detalle</Label>
              <Input
                id="detail"
                name="detail"
                placeholder={formType === "income" ? "Ej. Sueldo abril" : "Ej. Compra semanal"}
                defaultValue={selected?.detail ?? ""}
              />
              <p className="text-[0.82rem] text-muted-foreground">
                Usá un detalle que después puedas reconocer rápido en la lista y en búsquedas.
              </p>
            </div>
          </section>

          <section className="grouped-form-section space-y-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Etiquetas</p>
              <p className="text-xs text-muted-foreground">Mejoran filtros y reportes</p>
            </div>
            <div className="divide-y divide-border/60">
              <SettingPickerRow
                icon={getTransactionCategoryIcon(selectedCategoryName, formType)}
                label={categoryLabel}
                value={selectedCategoryName ?? "Sin categoría"}
                onClick={() => setPickerOpen("category")}
              />
              <SettingPickerRow
                icon={CreditCard}
                label={paymentMethodLabel}
                value={selectedMethodName ?? paymentMethodEmptyLabel}
                onClick={() => setPickerOpen("method")}
              />
              <SettingPickerRow
                icon={Landmark}
                label={accountLabel}
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
      ) : null}

      {!readOnly ? (
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
      ) : null}

      <Slideout
        open={pickerOpen !== null}
        title={
          pickerOpen === "category"
            ? categoryLabel
            : pickerOpen === "method"
              ? paymentMethodLabel
              : accountLabel
        }
        description="Elegí una opción para mejorar la lectura del movimiento y tus filtros futuros."
        onClose={() => setPickerOpen(null)}
      >
        {pickerOpen === "category" ? (
          <PickerOptionList
            value={formCategoryId}
            options={[
              { value: "", label: "Sin categoría" },
              ...formCategoryOptions.map((category) => ({ value: category.id, label: category.name })),
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
