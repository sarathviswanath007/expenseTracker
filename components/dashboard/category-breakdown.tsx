"use client";

import { PieChart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/format-currency";
import { foldCategoriesForChart } from "@/lib/chart-colors";
import type { CategoryTotal } from "@/lib/dashboard-math";
import type { Currency } from "@/types/budget";

export function CategoryBreakdown({
  categoryTotals,
  currency,
}: {
  categoryTotals: CategoryTotal[];
  currency: Currency;
}) {
  const total = categoryTotals.reduce((sum, c) => sum + c.amount, 0);
  const folded = foldCategoriesForChart(categoryTotals);

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <h2 className="font-medium">Where your money went</h2>

      {folded.length === 0 || total === 0 ? (
        <EmptyState
          icon={PieChart}
          title="No spending to break down yet"
          description="Once you log expenses, you'll see which categories take the biggest share."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {folded.map((entry) => {
            const share = (entry.amount / total) * 100;
            return (
              <li key={entry.category} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="truncate">{entry.category}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCurrency(entry.amount, currency)}
                    <span className="ml-2 text-xs">
                      {Math.round(share)}%
                    </span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${share}%`,
                      backgroundColor: entry.color,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
