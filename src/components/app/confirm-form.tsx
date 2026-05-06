"use client";

import * as React from "react";

import { ConfirmDialog } from "@/components/app/confirm-dialog";

type FormAction = string | ((formData: FormData) => void | Promise<void>);

export function ConfirmForm({
  confirm,
  confirmTitle = "Confirmar borrado",
  confirmLabel = "Borrar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  ...props
}: Omit<React.ComponentProps<"form">, "action"> & {
  action?: FormAction;
  confirm: string;
  confirmTitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [open, setOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  React.useEffect(() => {
    if (!confirmed) return;
    formRef.current?.requestSubmit();
  }, [confirmed]);

  return (
    <>
      <form
        {...props}
        ref={formRef}
        onSubmit={(event) => {
          props.onSubmit?.(event);
          if (event.defaultPrevented) return;
          if (confirmed) {
            onConfirm?.();
            return;
          }

          event.preventDefault();
          setOpen(true);
        }}
      />
      <ConfirmDialog
        open={open}
        title={confirmTitle}
        description={confirm}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onCancel={() => {
          setOpen(false);
          onCancel?.();
        }}
        onConfirm={() => {
          setOpen(false);
          setConfirmed(true);
        }}
      />
    </>
  );
}
