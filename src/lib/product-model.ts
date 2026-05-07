import type { DebtDirection, TransactionType } from "@prisma/client";

export function calculateDebtRemaining(originalAmount: number, payments: number[]) {
  const paid = payments.reduce((total, amount) => total + Math.max(0, amount), 0);
  return Math.max(0, originalAmount - paid);
}

export function isDebtSettled(originalAmount: number, payments: number[]) {
  return calculateDebtRemaining(originalAmount, payments) === 0;
}

export function debtPaymentTransactionType(direction: DebtDirection): TransactionType {
  return direction === "we_owe" ? "expense" : "income";
}

export function shouldCreateRecurringBillTransaction(createTransaction: boolean, paidAt?: string | Date | null) {
  return createTransaction && Boolean(paidAt);
}
