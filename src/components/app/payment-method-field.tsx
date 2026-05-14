"use client";

import * as React from "react";

import { PillChip } from "@/components/app/pill-chip";

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
        <button type="button" className="pressable" aria-pressed={value === ""} onClick={() => setValue("")}>
          <PillChip active={value === ""}>Sin medio</PillChip>
        </button>
        {normalizedQuick.map((method) => (
          <button
            key={method.id}
            type="button"
            className="pressable"
            aria-pressed={value === method.id}
            onClick={() => setValue(method.id)}
          >
            <PillChip active={value === method.id}>{method.name}</PillChip>
          </button>
        ))}
      </div>
    </div>
  );
}
