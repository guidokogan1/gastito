const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export type MoneyLike = number | string | { toString(): string };

export function toNumber(value: MoneyLike) {
  const parsed = typeof value === "number" ? value : Number(normalizeMoneyString(value.toString()));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function moneyInputValue(value: MoneyLike) {
  return formatMoneyInput(value.toString());
}

export function normalizeMoneyString(value: string) {
  const cleaned = value.trim().replace(/\s/g, "").replace(/\$/g, "");
  const numeric = cleaned.replace(/[^\d,.]/g, "");
  if (!numeric) return "";

  const commaIndex = numeric.lastIndexOf(",");
  const dotIndex = numeric.lastIndexOf(".");
  const decimalIndex = Math.max(commaIndex, dotIndex);
  const digitsAfterSeparator = decimalIndex >= 0 ? numeric.slice(decimalIndex + 1).replace(/\D/g, "") : "";
  const hasDecimal = decimalIndex >= 0 && digitsAfterSeparator.length > 0 && digitsAfterSeparator.length <= 2;

  if (!hasDecimal) return numeric.replace(/\D/g, "");

  const integerPart = numeric.slice(0, decimalIndex).replace(/\D/g, "") || "0";
  return `${integerPart}.${digitsAfterSeparator}`;
}

export function formatMoneyInput(value: MoneyLike) {
  const raw = value.toString();
  const cleaned = raw.replace(/[^\d,.]/g, "");
  if (!cleaned) return "";

  const commaIndex = cleaned.lastIndexOf(",");
  const dotIndex = cleaned.lastIndexOf(".");
  const decimalIndex = Math.max(commaIndex, dotIndex);
  const separator = decimalIndex >= 0 ? cleaned[decimalIndex] : "";
  const decimals = decimalIndex >= 0 ? cleaned.slice(decimalIndex + 1).replace(/\D/g, "").slice(0, 2) : "";
  const shouldKeepDecimal =
    decimalIndex >= 0 &&
    (separator === "," || decimals.length > 0) &&
    cleaned.slice(decimalIndex + 1).replace(/\D/g, "").length <= 2;
  const integerSource = shouldKeepDecimal ? cleaned.slice(0, decimalIndex) : cleaned;
  const integerDigits = integerSource.replace(/\D/g, "");
  const integerNumber = Number(integerDigits || 0);

  return `$${number.format(integerNumber)}${shouldKeepDecimal ? `,${decimals}` : ""}`;
}

export function formatArs(value: MoneyLike) {
  return money.format(toNumber(value)).replace(/\$\s+/, "$");
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
