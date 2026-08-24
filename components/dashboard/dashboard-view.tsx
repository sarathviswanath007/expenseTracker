"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format-currency";
import { MONTH_NAMES } from "@/lib/dates";
import type { DashboardSummary } from "@/types/analytics";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function DashboardView({
  month,
  year,
  summary,
}: {
  month: number;
  year: number;
  summary: DashboardSummary | null;
}) {
  const router = useRouter();

  function changeMonthYear(nextMonth: number, nextYear: number) {
    router.push(`/dashboard?month=${nextMonth}&year=${nextYear}`);
  }

  if (!summary) {
    return <p className="text-muted-foreground">Log in to view your dashboard.</p>;
  }

  const { currency } = summary;
  const money = (amount: number) => formatCurrency(amount, currency);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Your financial overview for the month.
        </p>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <Label>Month</Label>
          <Select
            value={String(month)}
            onValueChange={(value) =>
              value && changeMonthYear(Number(value), year)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((name, index) => (
                <SelectItem key={name} value={String(index + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Year</Label>
          <Select
            value={String(year)}
            onValueChange={(value) =>
              value && changeMonthYear(month, Number(value))
            }
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[year - 1, year, year + 1].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {summary.alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {summary.alerts.map((alert) => (
            <div
              key={alert.category}
              className={
                alert.status === "exceeded"
                  ? "rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                  : "rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
              }
            >
              {alert.status === "exceeded" ? (
                <>
                  🔴 Your {alert.category} budget has been exceeded by{" "}
                  {money(alert.amount - alert.allocatedAmount)}.
                </>
              ) : (
                <>
                  ⚠️ You have spent{" "}
                  {Math.round((alert.amount / alert.allocatedAmount) * 100)}%
                  of your {alert.category} budget.
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!summary.totalBudget && summary.alerts.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No budget set for {MONTH_NAMES[month - 1]} {year} yet.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total income" value={money(summary.totalIncome)} />
        <StatCard label="Total expenses" value={money(summary.totalExpenses)} />
        <StatCard label="Total savings" value={money(summary.totalSavings)} />
        <StatCard
          label="Remaining budget"
          value={money(summary.remainingBudget)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly budget utilization</CardTitle>
          <CardDescription>
            {money(summary.totalExpenses)} of {money(summary.totalBudget)} used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={Math.min(100, summary.utilizationPercent)} />
          <p className="mt-2 text-sm text-muted-foreground">
            {Math.round(summary.utilizationPercent)}% used
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top spending category</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.topCategory ? (
            <p>
              {summary.topCategory.category} —{" "}
              {money(summary.topCategory.amount)}
            </p>
          ) : (
            <p className="text-muted-foreground">No expenses yet this month.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.recentTransactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {summary.recentTransactions.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <span>
                    {expense.expenseDate} · {expense.category}
                    {expense.description ? ` · ${expense.description}` : ""}
                  </span>
                  <span className="font-medium">{money(expense.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
