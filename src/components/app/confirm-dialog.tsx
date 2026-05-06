"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title = "Confirmar acción",
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = true,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="confirm-dialog-panel">
        <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p id="confirm-dialog-title" className="text-[1.1rem] font-semibold tracking-[-0.02em]">
            {title}
          </p>
          <div className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">{description}</div>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={destructive ? "destructive" : "default"} onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
