"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgePercent,
  Banknote,
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
  RotateCcw,
  SortAsc,
  type LucideIcon,
} from "lucide-react";

import { formatArs, moneyInputValue, toNumber } from "@/lib/format";
import { DEFAULT_INCOME_CATEGORIES } from "@/lib/catalog";
import { FinanceList, FinanceRow } from "@/components/app/finance-list";
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
import { FinancialAmount } from "@/components/app/financial-amount";
import { MoneyField } from "@/components/app/money-field";
import { ScreenHeader } from "@/components/app/screen-header";
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

function normalizeOptionLabel(name?: string | null) {
  return (name ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

const INCOME_CATEGORY_NAMES = new Set(DEFAULT_INCOME_CATEGORIES.map((category) => normalizeOptionLabel(category.name)));
const INCOME_CATEGORY_ORDER = new Map(
  DEFAULT_INCOME_CATEGORIES.map((category, index) => [normalizeOptionLabel(category.name), index]),
);

function isIncomeCategoryName(name?: string | null) {
  return INCOME_CATEGORY_NAMES.has(normalizeOptionLabel(name));
}

function getCategoryIcon(name?: string | null, type: "expense" | "income" = "expense"): LucideIcon {
  const normalized = normalizeOptionLabel(name);
  if (normalized.includes("sueldo")) return Banknote;
  if (normalized.includes("devolucion")) return RotateCcw;
  if (normalized.includes("descuento")) return BadgePercent;
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
  initialComposeOpen = false,
  initialTransactionType = "expense",
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formPaymentMethodId, setFormPaymentMethodId] = useState<string>("");
  const [formAccountId, setFormAccountId] = useState<string>("");

  useEffect(() => {
    if (!initialComposeOpen) return;
    setSelectedId(null);
    setFormType(initialTransactionType);
    setDrawerOpen(true);
  }, [initialComposeOpen, initialTransactionType]);

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
            (INCOME_CATEGORY_ORDER.get(normalizeOptionLabel(a.name)) ?? 99) -
            (INCOME_CATEGORY_ORDER.get(normalizeOptionLabel(b.name)) ?? 99),
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

  return (
    <KineticPage className="space-y-5">
      <ScreenHeader
        title="Movimientos"
        action={
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
        }
      />
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
                <div className="finance-summary-strip rounded-[1.25rem] bg-[var(--surface-pill)] px-4 py-3">
                  <div className="finance-summary-cell">
                    <p className="stat-label">Gastos</p>
                    <p className="money-row mt-1 text-foreground">{formatArs(metrics.expenses)}</p>
                  </div>
                  <div className="finance-summary-cell">
                    <p className="stat-label">Ingresos</p>
                    <p className="money-row mt-1 text-[var(--income)] dark:text-[var(--income-soft)]">
                      {formatArs(metrics.incomes)}
                    </p>
                  </div>
                  <div className="finance-summary-cell">
                    <p className="stat-label">Balance</p>
                    <p
                      className={cn(
                        "money-row mt-1",
                        metrics.balance < 0 ? "text-foreground" : "text-[var(--income)] dark:text-[var(--income-soft)]",
                      )}
                    >
                      {formatArs(metrics.balance)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {searchOpen ? (
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                      <Input
                        id="tx-search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar movimiento"
                        className="h-13 rounded-[1.25rem] pl-11 text-[1.05rem]"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <Button type="button" variant="secondary" className="w-full justify-start rounded-[1.25rem]" onClick={() => setSearchOpen(true)}>
                      <Search className="size-5 text-muted-foreground" aria-hidden />
                      Buscar movimiento
                    </Button>
                  )}
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
                      <button type="button" className="pressable" onClick={() => setDateFilter(dateFilter === "today" ? "all" : "today")}>
                        <PillChip active={dateFilter === "today"}>Hoy</PillChip>
                      </button>
                      <button type="button" className="pressable" onClick={() => setDateFilter(dateFilter === "7d" ? "all" : "7d")}>
                        <PillChip active={dateFilter === "7d"} className="whitespace-nowrap">7 días</PillChip>
                      </button>
                      <button type="button" className="pressable" onClick={() => setDateFilter(dateFilter === "14d" ? "all" : "14d")}>
                        <PillChip active={dateFilter === "14d"} className="whitespace-nowrap">14 días</PillChip>
                      </button>
                      <button type="button" className="pressable" onClick={() => setDateFilter(dateFilter === "30d" ? "all" : "30d")}>
                        <PillChip active={dateFilter === "30d"} className="whitespace-nowrap">30 días</PillChip>
                      </button>
                      <button type="button" className="pressable" onClick={() => setCategoryFilterId(categoryFilterId === "none" ? "all" : "none")}>
                        <PillChip active={categoryFilterId === "none"}>Sin categoría</PillChip>
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
                        setDateFilter("all");
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
                                meta={[row.categoryName, row.paymentMethodName, row.accountName].filter(Boolean).join(" · ") || undefined}
                                amount={
                                  <span className="inline-flex items-center gap-2">
                                    <FinancialAmount value={row.amount} direction={row.type === "income" ? "income" : "expense"} showSign />
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

          <section className="grouped-form-section space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">Orden</p>
              <SortAsc className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <div className="mobile-scroll-row">
              <button type="button" className="pressable" onClick={() => setSortBy("date-desc")}>
                <PillChip active={sortBy === "date-desc"}>Más recientes</PillChip>
              </button>
              <button type="button" className="pressable" onClick={() => setSortBy("amount-desc")}>
                <PillChip active={sortBy === "amount-desc"}>Mayor monto</PillChip>
              </button>
              <button type="button" className="pressable" onClick={() => setSortBy("amount-asc")}>
                <PillChip active={sortBy === "amount-asc"}>Menor monto</PillChip>
              </button>
            </div>
          </section>

          <section className="grouped-form-section space-y-2">
            <p className="text-sm font-medium">Totales del filtro</p>
            <div className="finance-summary-strip">
              <div className="finance-summary-cell">
                <p className="stat-label">Gastos</p>
                <p className="money-row mt-1">{formatArs(metrics.expenses)}</p>
              </div>
              <div className="finance-summary-cell">
                <p className="stat-label">Ingresos</p>
                <p className="money-row mt-1 text-[var(--income)]">{formatArs(metrics.incomes)}</p>
              </div>
              <div className="finance-summary-cell">
                <p className="stat-label">Balance</p>
                <p className="money-row mt-1">{formatArs(metrics.balance)}</p>
              </div>
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
                  onClick={() => {
                    setQuery("");
                    setTypeFilter("all");
                    setCategoryFilterId("all");
                    setMethodFilterId("all");
                    setDateFilter("all");
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
        description={undefined}
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
            <div className="space-y-2 text-center">
              <MoneyField
                id="amount"
                name="amount"
                defaultValue={selected ? moneyInputValue(selected.amount) : ""}
                showPreview={false}
              />
            </div>
            <div className="grid grid-cols-2 rounded-full bg-[var(--surface-pill)] p-1">
              <Button
                type="button"
                variant={formType === "expense" ? "default" : "ghost"}
                className="h-11 rounded-full"
                onClick={() => setFormType("expense")}
              >
                Gasto
              </Button>
              <Button
                type="button"
                variant={formType === "income" ? "default" : "ghost"}
                className="h-11 rounded-full"
                onClick={() => setFormType("income")}
              >
                Ingreso
              </Button>
            </div>

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
            ? categoryLabel
            : pickerOpen === "method"
              ? paymentMethodLabel
              : accountLabel
        }
        description="Elegí una opción para el movimiento."
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
