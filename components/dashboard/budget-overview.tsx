"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format-currency";
import { getCategoryAlertStatus } from "@/lib/budget-alerts";
import type { CategoryTotal } from "@/lib/dashboard-math";
import type { BudgetCategoryRecord } from "@/services/budget.service";
import type { Currency } from "@/types/budget";

const BAR_TONE = {
  ok: "bg-primary",
  warning: "bg-attention",
  exceeded: "bg-critical",
} as const;

/**
 * The month's plan and how much of it is used, per category. Useful the
 * moment a budget exists — it doesn't wait for spending to say something.
 */
export function BudgetOverview({
  categories,
  categoryTotals,
  currency,
  totalBudget,
  totalExpenses,
  month,
  year,
  className,
}: {
  categories: BudgetCategoryRecord[];
  categoryTotals: CategoryTotal[];
  currency: Currency;
  totalBudget: number;
  totalExpenses: number;
  month: number;
  year: number;
  className?: string;
}) {
  const spentByCategory = new Map(
    categoryTotals.map((entry) => [entry.category, entry.amount]),
  );
  const budgetHref = `/budgets?month=${month}&year=${year}`;
  const remaining = totalBudget - totalExpenses;

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-medium">Budget by category</h2>
          {categories.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {formatCurrency(totalExpenses, currency)} of{" "}
              {formatCurrency(totalBudget, currency)} spent ·{" "}
              <span
                className={cn(
                  "font-medium",
                  remaining < 0 ? "text-critical" : "text-foreground",
                )}
              >
                {formatCurrency(Math.abs(remaining), currency)}{" "}
                {remaining < 0 ? "over" : "left"}
              </span>
            </p>
          )}
        </div>
        {categories.length > 0 && (
          <Button
            render={<Link href={budgetHref} />}
            nativeButton={false}
            variant="ghost"
            size="xs"
          >
            Reset
          </Button>
        )}
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budget for this month"
          description="Set a limit per category and this is where you'll watch it fill up."
          action={
            <Button
              render={<Link href={budgetHref} />}
              nativeButton={false}
              size="sm"
            >
              Create budget
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3.5">
          {categories.map((category) => {
            const spent = spentByCategory.get(category.category) ?? 0;
            const status = getCategoryAlertStatus(
              spent,
              category.allocatedAmount,
              category.alertThresholdPercent,
            );
            const percent =
              category.allocatedAmount > 0
                ? Math.min(100, (spent / category.allocatedAmount) * 100)
                : 0;

            return (
              <li key={category.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate font-medium">
                    {category.category}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCurrency(spent, currency)}
                    <span className="text-muted-foreground/70">
                      {" / "}
                      {formatCurrency(category.allocatedAmount, currency)}
                    </span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      BAR_TONE[status],
                    )}
                    style={{ width: `${percent}%` }}
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
