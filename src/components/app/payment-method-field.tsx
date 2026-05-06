"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
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

  const normalizedQuick = React.useMemo(() => {
    const seen = new Set<string>();
    const result: Option[] = [];
    const source = quickMethods.length ? quickMethods : methods;
    for (const method of source) {
      if (seen.has(method.id)) continue;
      seen.add(method.id);
      result.push(method);
    }
    return result;
  }, [methods, quickMethods]);

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2.5">
        <Button
          type="button"
          variant={value === "" ? "default" : "outline"}
          className={cn("h-11 rounded-full px-4 text-[0.98rem]", value !== "" && "bg-background")}
          onClick={() => setValue("")}
        >
          Sin medio
        </Button>
        {normalizedQuick.map((method) => (
          <Button
            key={method.id}
            type="button"
            variant={value === method.id ? "default" : "outline"}
            className={cn("h-11 rounded-full px-4 text-[0.98rem]", value !== method.id && "bg-background")}
            onClick={() => setValue(method.id)}
          >
            {method.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
