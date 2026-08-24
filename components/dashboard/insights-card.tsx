"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import type { CategoryAlert, CategoryChange } from "@/types/analytics";
import type { Currency } from "@/types/budget";

export function InsightsCard({
  alerts,
  categoryChanges,
  currency,
  month,
  year,
}: {
  alerts: CategoryAlert[];
  categoryChanges: CategoryChange[];
  currency: Currency;
  month: number;
  year: number;
}) {
  // Cap the combined list so the card stays scannable; budget alerts are the
  // more urgent signal, so they claim the slots first.
  const MAX_ITEMS = 3;
  const shownAlerts = alerts.slice(0, MAX_ITEMS);
  const movers = categoryChanges
    .filter((c) => Math.abs(c.percentChange ?? 0) >= 10)
    .slice(0, MAX_ITEMS - shownAlerts.length);

  const hasContent = shownAlerts.length > 0 || movers.length > 0;

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-medium">What changed this month</h2>
            <p className="text-xs text-muted-foreground">
              Calculated from your budgets and spending.
            </p>
          </div>
        </div>
        <Button render={<Link href="/insights" />} variant="ghost" size="xs">
          View all
        </Button>
      </div>

      {!hasContent ? (
        <p className="text-sm text-muted-foreground">
          Nothing notable yet. Once you have a couple of months of expenses,
          category changes and budget warnings will show up here.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {shownAlerts.map((alert) => {
            const over = alert.status === "exceeded";
            return (
              <li
                key={`alert-${alert.category}`}
                className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3"
              >
                <span
                  className={cn(
                    "mt-0.5 size-2 shrink-0 rounded-full",
                    over ? "bg-critical" : "bg-warning",
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    {over ? (
                      <>
                        <span className="font-medium text-critical">
                          Over budget:
                        </span>{" "}
                        {alert.category} is{" "}
                        {formatCurrency(
                          alert.amount - alert.allocatedAmount,
                          currency,
                        )}{" "}
                        past its{" "}
                        {formatCurrency(alert.allocatedAmount, currency)} limit.
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-warning">
                          Approaching limit:
                        </span>{" "}
                        {alert.category} is at{" "}
                        {Math.round(
                          (alert.amount / alert.allocatedAmount) * 100,
                        )}
                        % of its{" "}
                        {formatCurrency(alert.allocatedAmount, currency)} budget.
                      </>
                    )}
                  </p>
                  <Button
                    render={
                      <Link href={`/budgets?month=${month}&year=${year}`} />
                    }
                    variant="ghost"
                    size="xs"
                    className="mt-1 -ml-2"
                  >
                    Adjust budget
                  </Button>
                </div>
              </li>
            );
          })}

          {movers.map((change) => {
            const up = (change.percentChange ?? 0) > 0;
            const Icon = up ? ArrowUpRight : ArrowDownRight;
            return (
              <li
                key={`change-${change.category}`}
                className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3"
              >
                <Icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    up ? "text-critical" : "text-positive",
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{change.category}</span>{" "}
                    spending is {up ? "up" : "down"}{" "}
                    <span className="font-medium">
                      {Math.abs(Math.round(change.percentChange ?? 0))}%
                    </span>{" "}
                    vs last month —{" "}
                    {formatCurrency(change.amount, currency)} after{" "}
                    {formatCurrency(change.previousAmount, currency)}.
                  </p>
                  <Button
                    render={
                      <Link href={`/expenses?category=${encodeURIComponent(change.category)}`} />
                    }
                    variant="ghost"
                    size="xs"
                    className="mt-1 -ml-2"
                  >
                    Review {change.category}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
