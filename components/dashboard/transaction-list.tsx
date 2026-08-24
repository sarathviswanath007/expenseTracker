"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/format-currency";
import type { Currency } from "@/types/budget";
import type { Expense } from "@/types/expense";

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function TransactionList({
  transactions,
  currency,
}: {
  transactions: Expense[];
  currency: Currency;
}) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium">Recent transactions</h2>
        {transactions.length > 0 && (
          <Button render={<Link href="/expenses" />} variant="ghost" size="xs">
            View all
          </Button>
        )}
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses recorded yet"
          description="Start tracking your spending to unlock personalized insights."
          action={
            <Button render={<Link href="/expenses" />} size="sm">
              Add your first expense
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col">
          {transactions.map((expense) => (
            <li
              key={expense.id}
              className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Receipt className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {expense.description || expense.category}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {expense.category} · {formatDate(expense.expenseDate)} ·{" "}
                    {expense.paymentMethod}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums">
                −{formatCurrency(expense.amount, currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
