"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTH_NAMES } from "@/lib/dates";
import { ExpensesByCategoryChart } from "@/components/charts/expenses-by-category-chart";
import { MonthlySpendingTrendChart } from "@/components/charts/monthly-spending-trend-chart";
import { BudgetVsActualChart } from "@/components/charts/budget-vs-actual-chart";
import { IncomeVsExpenseChart } from "@/components/charts/income-vs-expense-chart";
import { SavingsTrendChart } from "@/components/charts/savings-trend-chart";
import type { CategoryTotal } from "@/lib/dashboard-math";
import type {
  BudgetVsActualPoint,
  IncomeVsExpensePoint,
  SavingsTrendPoint,
  SpendingTrendPoint,
} from "@/types/analytics";
import type { Currency } from "@/types/budget";

export function AnalyticsView({
  month,
  year,
  currency,
  expensesByCategory,
  budgetVsActual,
  spendingTrend,
  incomeVsExpense,
  savingsTrend,
}: {
  month: number;
  year: number;
  currency: Currency;
  expensesByCategory: CategoryTotal[];
  budgetVsActual: BudgetVsActualPoint[];
  spendingTrend: SpendingTrendPoint[];
  incomeVsExpense: IncomeVsExpensePoint[];
  savingsTrend: SavingsTrendPoint[];
}) {
  const router = useRouter();

  function changeMonthYear(nextMonth: number, nextYear: number) {
    router.push(`/analytics?month=${nextMonth}&year=${nextYear}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <Label>Month</Label>
          <Select
            value={String(month)}
            onValueChange={(value) =>
              value && changeMonthYear(Number(value), year)
            }
          >
            <SelectTrigger className="w-40" aria-label="Month">
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
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Year</Label>
          <Select
            value={String(year)}
            onValueChange={(value) =>
              value && changeMonthYear(month, Number(value))
            }
          >
            <SelectTrigger className="w-28" aria-label="Year">
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

      <Card>
        <CardHeader>
          <CardTitle>Expenses by category</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpensesByCategoryChart data={expensesByCategory} currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly spending trend</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlySpendingTrendChart data={spendingTrend} currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget vs actual</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetVsActualChart data={budgetVsActual} currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income vs expense</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeVsExpenseChart data={incomeVsExpense} currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Savings trend</CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsTrendChart data={savingsTrend} currency={currency} />
        </CardContent>
      </Card>
    </div>
  );
}
