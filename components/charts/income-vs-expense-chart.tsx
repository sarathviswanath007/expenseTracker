"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLegend } from "@/components/charts/chart-legend";
import { CurrencyTooltip } from "@/components/charts/chart-tooltip";
import { formatAxisCurrency } from "@/lib/format-currency";
import type { IncomeVsExpensePoint } from "@/types/analytics";
import type { Currency } from "@/types/budget";

export function IncomeVsExpenseChart({
  data,
  currency,
}: {
  data: IncomeVsExpensePoint[];
  currency: Currency;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: 8, right: 16, top: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatAxisCurrency(value, currency)}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          content={<CurrencyTooltip currency={currency} />}
          cursor={{ fill: "var(--muted)" }}
        />
        <Legend
          content={() => (
            <ChartLegend
              items={[
                { label: "Income", color: "var(--chart-1)" },
                { label: "Expense", color: "var(--chart-2)" },
              ]}
            />
          )}
        />
        <Bar dataKey="income" name="Income" fill="var(--chart-1)" radius={[4, 4, 0, 0]} barSize={20} />
        <Bar dataKey="expense" name="Expense" fill="var(--chart-2)" radius={[4, 4, 0, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
