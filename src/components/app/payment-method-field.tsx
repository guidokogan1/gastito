"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { SearchPicker } from "@/components/ui/search-picker";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

export function PaymentMethodField({
  name,
  defaultValue,
  methods,
  quickMethods,
}: {
  name: string;
  defaultValue: string;
  methods: Option[];
  quickMethods: Option[];
}) {
  const [value, setValue] = React.useState(defaultValue);

  const options = React.useMemo(
    () => [{ value: "", label: "Sin medio" }, ...methods.map((m) => ({ value: m.id, label: m.name }))],
    [methods],
  );

  const normalizedQuick = React.useMemo(() => {
    const seen = new Set<string>();
    const result: Option[] = [];
    for (const method of quickMethods) {
      if (seen.has(method.id)) continue;
      seen.add(method.id);
      result.push(method);
    }
    return result.slice(0, 6);
  }, [quickMethods]);

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={value === "" ? "default" : "outline"}
          size="sm"
          className={cn("h-9 rounded-full", value !== "" && "bg-background")}
          onClick={() => setValue("")}
        >
          Sin medio
        </Button>
        {normalizedQuick.map((method) => (
          <Button
            key={method.id}
            type="button"
            variant={value === method.id ? "default" : "outline"}
            size="sm"
            className={cn("h-9 rounded-full", value !== method.id && "bg-background")}
            onClick={() => setValue(method.id)}
          >
            {method.name}
          </Button>
        ))}
        <SearchPicker value={value} placeholder="Más…" options={options} onValueChange={setValue} className="h-9" />
      </div>
    </div>
  );
}

