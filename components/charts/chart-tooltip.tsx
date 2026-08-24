"use client";

import { formatCurrency } from "@/lib/format-currency";
import type { Currency } from "@/types/budget";

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
}

export function CurrencyTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  currency: Currency;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-popover p-2.5 text-sm shadow-md">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-0.5 w-3 shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-semibold text-foreground tabular-nums">
              {formatCurrency(entry.value ?? 0, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
