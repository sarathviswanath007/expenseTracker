"use client";

import { useRouter } from "next/navigation";
import { PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTH_NAMES } from "@/lib/dates";
import { calculatePercentChange } from "@/lib/dashboard-math";
import { MetricCard } from "@/components/dashboard/metric-card";
import { BudgetProgressCard } from "@/components/dashboard/budget-progress-card";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { GetStartedPanel } from "@/components/dashboard/get-started-panel";
import { IncomeVsExpenseChart } from "@/components/charts/income-vs-expense-chart";
import type { DashboardSummary, IncomeVsExpensePoint } from "@/types/analytics";

export function DashboardView({
  month,
  year,
  summary,
  incomeVsExpense,
}: {
  month: number;
  year: number;
  summary: DashboardSummary | null;
  incomeVsExpense: IncomeVsExpensePoint[];
}) {
  const router = useRouter();

  function changeMonthYear(nextMonth: number, nextYear: number) {
    router.push(`/dashboard?month=${nextMonth}&year=${nextYear}`);
  }

  if (!summary) {
    return (
      <p className="p-6 text-muted-foreground">
        Log in to view your dashboard.
      </p>
    );
  }

  const { currency, previousMonth, setup } = summary;
  const comparable = previousMonth.hasData;
  // A brand-new account gets the setup panel instead of a grid of zeros.
  const isFirstRun = !setup.hasAnyBudget || !setup.hasAnyExpense;

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {MONTH_NAMES[month - 1]} {year}
        </p>
        <div className="flex items-end gap-2">
          <Select
            value={String(month)}
            onValueChange={(value) =>
              value && changeMonthYear(Number(value), year)
            }
          >
            <SelectTrigger size="sm" className="w-36" aria-label="Month">
              <SelectValue>
                {(value) => MONTH_NAMES[Number(value) - 1]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((name, index) => (
                <SelectItem key={name} value={String(index + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(year)}
            onValueChange={(value) =>
              value && changeMonthYear(month, Number(value))
            }
          >
            <SelectTrigger size="sm" className="w-24" aria-label="Year">
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

      {isFirstRun && <GetStartedPanel setup={setup} />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total income"
          amount={summary.totalIncome}
          currency={currency}
          icon={TrendingUp}
          percentChange={
            comparable
              ? calculatePercentChange(
                  summary.totalIncome,
                  previousMonth.totalIncome,
                )
              : null
          }
          upIsGood
        />
        <MetricCard
          label="Total expenses"
          amount={summary.totalExpenses}
          currency={currency}
          icon={TrendingDown}
          percentChange={
            comparable
              ? calculatePercentChange(
                  summary.totalExpenses,
                  previousMonth.totalExpenses,
                )
              : null
          }
          upIsGood={false}
          href="/expenses"
        />
        <MetricCard
          label="Total savings"
          amount={summary.totalSavings}
          currency={currency}
          icon={PiggyBank}
          tone={summary.totalSavings < 0 ? "critical" : "positive"}
          percentChange={
            comparable
              ? calculatePercentChange(
                  summary.totalSavings,
                  previousMonth.totalSavings,
                )
              : null
          }
          upIsGood
        />
        <MetricCard
          label="Remaining budget"
          amount={summary.remainingBudget}
          currency={currency}
          icon={Wallet}
          tone={summary.remainingBudget < 0 ? "critical" : "neutral"}
          href={`/budgets?month=${month}&year=${year}`}
        />
      </div>

      {!isFirstRun && (
        <InsightsCard
          alerts={summary.alerts}
          categoryChanges={summary.categoryChanges}
          currency={currency}
          month={month}
          year={year}
        />
      )}

      {/* Both halves of this row are empty or duplicate the setup panel's CTA
          until there is a budget and some spending to chart. */}
      {!isFirstRun && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 lg:col-span-2">
            <div>
              <h2 className="font-medium">Income vs expenses</h2>
              <p className="text-sm text-muted-foreground">
                The last six months, ending {MONTH_NAMES[month - 1]} {year}.
              </p>
            </div>
            <IncomeVsExpenseChart data={incomeVsExpense} currency={currency} />
          </div>
          <BudgetProgressCard
            totalBudget={summary.totalBudget}
            totalExpenses={summary.totalExpenses}
            remainingBudget={summary.remainingBudget}
            utilizationPercent={summary.utilizationPercent}
            currency={currency}
            month={month}
            year={year}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <CategoryBreakdown
          categoryTotals={summary.categoryTotals}
          currency={currency}
        />
        <TransactionList
          transactions={summary.recentTransactions}
          currency={currency}
        />
      </div>
    </div>
  );
}
