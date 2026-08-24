"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CurrencyTooltip } from "@/components/charts/chart-tooltip";
import { formatAxisCurrency, formatCurrency } from "@/lib/format-currency";
import { foldCategoriesForChart } from "@/lib/chart-colors";
import type { CategoryTotal } from "@/lib/dashboard-math";
import type { Currency } from "@/types/budget";

export function ExpensesByCategoryChart({
  data,
  currency,
}: {
  data: CategoryTotal[];
  currency: Currency;
}) {
  const folded = foldCategoriesForChart(data);

  if (folded.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No expenses yet this month.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, folded.length * 40)}>
      <BarChart data={folded} layout="vertical" margin={{ left: 8, right: 48 }}>
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
        <Bar dataKey="amount" name="Spent" radius={[0, 4, 4, 0]} barSize={20}>
          {folded.map((entry) => (
            <Cell key={entry.category} fill={entry.color} />
          ))}
          <LabelList
            dataKey="amount"
            position="right"
            formatter={(value: string | number | boolean | null | undefined) =>
              formatCurrency(Number(value) || 0, currency)
            }
            style={{ fill: "var(--foreground)", fontSize: 12 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
