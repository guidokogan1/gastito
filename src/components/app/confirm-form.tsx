"use client";

import * as React from "react";

type FormAction = string | ((formData: FormData) => void | Promise<void>);

export function ConfirmForm({
  confirm,
  onConfirm,
  onCancel,
  ...props
}: Omit<React.ComponentProps<"form">, "action"> & {
  action?: FormAction;
  confirm: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  return (
    <form
      {...props}
      onSubmit={(event) => {
        props.onSubmit?.(event);
        if (event.defaultPrevented) return;

        const ok = window.confirm(confirm);
        if (!ok) {
          event.preventDefault();
          onCancel?.();
          return;
        }

        onConfirm?.();
      }}
    />
  );
}
