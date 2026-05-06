const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export type MoneyLike = number | string | { toString(): string };

export function toNumber(value: MoneyLike) {
  const parsed = typeof value === "number" ? value : Number(value.toString());
  return Number.isFinite(parsed) ? parsed : 0;
}

export function moneyInputValue(value: MoneyLike) {
  const parsed = toNumber(value);
  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(2);
}

export function formatArs(value: MoneyLike) {
  return money.format(toNumber(value));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
