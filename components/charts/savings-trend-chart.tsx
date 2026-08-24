"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CurrencyTooltip } from "@/components/charts/chart-tooltip";
import { formatAxisCurrency } from "@/lib/format-currency";
import type { SavingsTrendPoint } from "@/types/analytics";
import type { Currency } from "@/types/budget";

export function SavingsTrendChart({
  data,
  currency,
}: {
  data: SavingsTrendPoint[];
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
        <ReferenceLine y={0} stroke="var(--border)" />
        <Tooltip
          content={<CurrencyTooltip currency={currency} />}
          cursor={{ stroke: "var(--border)" }}
        />
        <Line
          type="monotone"
          dataKey="savings"
          name="Savings"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--background)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
