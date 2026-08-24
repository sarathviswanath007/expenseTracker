"use client";

import Link from "next/link";
import { CheckCircle2, TriangleAlert, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format-currency";
import type { Currency } from "@/types/budget";

function statusFor(percent: number) {
  if (percent > 100) {
    return {
      key: "over" as const,
      label: "Over budget",
      message: "You've spent more than you planned this month.",
      icon: XCircle,
      text: "text-critical",
      bar: "bg-critical",
    };
  }
  if (percent >= 85) {
    return {
      key: "close" as const,
      label: "Approaching limit",
      message: "You're close to your monthly limit.",
      icon: TriangleAlert,
      text: "text-warning",
      bar: "bg-warning",
    };
  }
  return {
    key: "ok" as const,
    label: "On track",
    message: "Your spending is within plan.",
    icon: CheckCircle2,
    text: "text-positive",
    bar: "bg-primary",
  };
}

export function BudgetProgressCard({
  totalBudget,
  totalExpenses,
  remainingBudget,
  utilizationPercent,
  currency,
  month,
  year,
}: {
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  utilizationPercent: number;
  currency: Currency;
  month: number;
  year: number;
}) {
  if (totalBudget <= 0) {
    return (
      <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-medium">Budget utilization</h2>
        <div className="flex flex-1 flex-col items-start justify-center gap-3">
          <p className="text-sm text-muted-foreground">
            No budget set for this month yet. Create one to track how much of
            your plan you&apos;ve used.
          </p>
          <Button
            render={<Link href={`/budgets?month=${month}&year=${year}`} />}
            size="sm"
          >
            Create budget
          </Button>
        </div>
      </div>
    );
  }

  const status = statusFor(utilizationPercent);
  const StatusIcon = status.icon;
  const rounded = Math.round(utilizationPercent);

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-medium">Budget utilization</h2>
        <Button
          render={<Link href={`/budgets?month=${month}&year=${year}`} />}
          variant="ghost"
          size="xs"
        >
          Adjust
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-2xl font-semibold tracking-tight">{rounded}%</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(totalExpenses, currency)} of{" "}
          {formatCurrency(totalBudget, currency)} used
        </p>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Budget used"
      >
        <div
          className={cn("h-full rounded-full transition-all", status.bar)}
          style={{ width: `${Math.min(100, Math.max(0, utilizationPercent))}%` }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm">
          <span className="text-muted-foreground">Remaining: </span>
          <span
            className={cn(
              "font-medium",
              remainingBudget < 0 ? "text-critical" : "text-foreground",
            )}
          >
            {formatCurrency(remainingBudget, currency)}
          </span>
        </p>
        <p className={cn("flex items-start gap-1.5 text-sm", status.text)}>
          <StatusIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-medium">{status.label}</span>
            <span className="text-muted-foreground"> — {status.message}</span>
          </span>
        </p>
      </div>
    </div>
  );
}
