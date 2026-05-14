"use client";

import { useMemo, useState } from "react";

import { ResourceSheet } from "@/components/app/resource-sheet";
import { MoneyField } from "@/components/app/money-field";
import { SubmitButton } from "@/components/app/submit-button";
import { Button } from "@/components/ui/button";
import { CheckboxLine } from "@/components/ui/checkbox-line";
import { DateField } from "@/components/ui/date-field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatArs, moneyInputValue } from "@/lib/format";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function getDebtPaymentQuickAmounts(remaining: number) {
  return {
    halfAmount: Math.max(0, Math.round((remaining / 2) * 100) / 100),
    settleAmount: Math.max(0, Math.round(remaining * 100) / 100),
  };
}

export function DebtPaymentSheet({
  debtId,
  entityName,
  remaining,
  direction,
  action,
}: {
  debtId: string;
  entityName: string;
  remaining: number;
  direction: "we_owe" | "they_owe_us";
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const { halfAmount, settleAmount } = useMemo(() => getDebtPaymentQuickAmounts(remaining), [remaining]);
  const isWeOwe = direction === "we_owe";
  const title = isWeOwe ? "Registrar abono" : "Registrar cobro";
  const fieldLabel = isWeOwe ? "Monto abonado" : "Monto cobrado";
  const notePlaceholder = isWeOwe ? "Ej. Primer pago" : "Ej. Cobro parcial";
  const transactionCopy = isWeOwe ? "Registrar también como movimiento" : "Registrar también como ingreso";

  return (
    <ResourceSheet
      title={title}
      triggerAsChild
      trigger={<Button className="w-full">{title}</Button>}
    >
      <form action={action} className="space-y-4">
        <input type="hidden" name="debtId" value={debtId} />
        <section className="grouped-form-section space-y-4">
          <p className="section-eyebrow text-center">{isWeOwe ? "Nuevo abono" : "Nuevo cobro"}</p>
          <h2 className="text-center text-[1.6rem] font-semibold tracking-[-0.02em]">{entityName}</h2>
          <MoneyField id="amount" name="amount" label={fieldLabel} defaultValue={amount} showPreview={false} />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" className="h-12" onClick={() => setAmount(moneyInputValue(halfAmount))}>
              Mitad · {formatArs(halfAmount)}
            </Button>
            <Button type="button" variant="secondary" className="h-12" onClick={() => setAmount(moneyInputValue(settleAmount))}>
              Saldar · {formatArs(settleAmount)}
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label>Fecha</Label>
            <DateField name="date" defaultValue={todayIso()} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paymentNotes">Motivo</Label>
            <Textarea id="paymentNotes" name="notes" placeholder={notePlaceholder} />
          </div>
          <CheckboxLine name="createTransaction" defaultChecked>
            {transactionCopy}
          </CheckboxLine>
        </section>
        <div className="sheet-action-bar">
          <SubmitButton type="submit" className="w-full" pendingText="Confirmando...">
            {isWeOwe ? "Confirmar abono" : "Confirmar cobro"}
          </SubmitButton>
        </div>
      </form>
    </ResourceSheet>
  );
}
