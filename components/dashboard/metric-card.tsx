"use client";

import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format-currency";
import type { Currency } from "@/types/budget";

export function TrendIndicator({
  percentChange,
  /** Whether an increase is a good thing (income up = good, expenses up = bad). */
  upIsGood,
  className,
}: {
  percentChange: number | null;
  upIsGood: boolean;
  className?: string;
}) {
  if (percentChange === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs text-muted-foreground",
          className,
        )}
      >
        <Minus className="size-3" aria-hidden="true" />
        No prior month
      </span>
    );
  }

  const rounded = Math.round(Math.abs(percentChange) * 10) / 10;
  const up = percentChange > 0;
  const flat = rounded === 0;
  const good = flat ? null : up === upIsGood;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        good === null && "text-muted-foreground",
        good === true && "text-positive",
        good === false && "text-critical",
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {flat ? "No change" : `${rounded}%`}
      <span className="font-normal text-muted-foreground">vs last month</span>
    </span>
  );
}

export function MetricCard({
  label,
  amount,
  currency,
  icon: Icon,
  percentChange,
  upIsGood,
  tone = "neutral",
}: {
  label: string;
  amount: number;
  currency: Currency;
  icon: LucideIcon;
  percentChange?: number | null;
  upIsGood?: boolean;
  tone?: "neutral" | "positive" | "critical";
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p
        className={cn(
          "text-2xl font-semibold tracking-tight",
          tone === "positive" && "text-positive",
          tone === "critical" && "text-critical",
        )}
      >
        {formatCurrency(amount, currency)}
      </p>
      {percentChange !== undefined && upIsGood !== undefined && (
        <TrendIndicator percentChange={percentChange} upIsGood={upIsGood} />
      )}
    </div>
  );
}
