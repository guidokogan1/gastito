"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";

export function SubmitButton({
  children,
  pendingText = "Guardando...",
  disabled,
  ...props
}: ButtonProps & {
  pendingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} disabled={pending || disabled} aria-busy={pending ? true : undefined}>
      {pending ? pendingText : children}
    </Button>
  );
}
