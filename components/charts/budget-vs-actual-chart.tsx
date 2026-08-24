"use client";

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLegend } from "@/components/charts/chart-legend";
import { CurrencyTooltip } from "@/components/charts/chart-tooltip";
import { formatAxisCurrency } from "@/lib/format-currency";
import type { BudgetVsActualPoint } from "@/types/analytics";
import type { Currency } from "@/types/budget";

export function BudgetVsActualChart({
  data,
  currency,
}: {
  data: BudgetVsActualPoint[];
  currency: Currency;
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No budget set for this month yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 50)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <XAxis
          type="number"
          tickFormatter={(value) => formatAxisCurrency(value, currency)}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          width={100}
          tick={{ fill: "var(--foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={<CurrencyTooltip currency={currency} />}
        />
        <Legend
          content={() => (
            <ChartLegend
              items={[
                { label: "Planned", color: "var(--chart-1)" },
                { label: "Actual", color: "var(--chart-2)" },
              ]}
            />
          )}
        />
        <Bar dataKey="planned" name="Planned" fill="var(--chart-1)" radius={[0, 4, 4, 0]} barSize={16} />
        <Bar dataKey="actual" name="Actual" fill="var(--chart-2)" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
