"use client";

import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordField({
  id = "password",
  name = "password",
  label = "Contraseña",
  autoComplete,
  autoFocus,
  showRules = true,
}: {
  id?: string;
  name?: string;
  label?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  showRules?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const strength = useMemo(() => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-ZÁÉÍÓÚÑ]/.test(value) && /[a-záéíóúñ]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(value)) score += 1;
    return score;
  }, [value]);
  const labelText = strength >= 3 ? "Fuerte" : strength >= 2 ? "Bien" : value.length > 0 ? "Débil" : "Mínimo 8 caracteres";

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={8}
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="pr-12"
          aria-describedby={showRules ? `${id}-rules` : undefined}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-0.5 top-0.5"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </Button>
      </div>
      {showRules ? (
        <div id={`${id}-rules`} className="space-y-1">
          <div className="grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((item) => (
              <span
                key={item}
                className={item < strength ? "h-1 rounded-full bg-[var(--income)]" : "h-1 rounded-full bg-muted"}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-muted-foreground">{labelText}</p>
        </div>
      ) : null}
    </div>
  );
}
