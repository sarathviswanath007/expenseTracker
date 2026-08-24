"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CurrencyTooltip } from "@/components/charts/chart-tooltip";
import { formatAxisCurrency } from "@/lib/format-currency";
import type { SpendingTrendPoint } from "@/types/analytics";
import type { Currency } from "@/types/budget";

export function MonthlySpendingTrendChart({
  data,
  currency,
}: {
  data: SpendingTrendPoint[];
  currency: Currency;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: 8, right: 16, top: 8 }}>
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
          cursor={{ stroke: "var(--border)" }}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="Spending"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--background)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
