"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageContainer } from "@/components/shell/page-container";
import {
  MonthYearPicker,
  PageToolbar,
} from "@/components/shell/month-year-picker";
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
    <PageContainer>
      <PageToolbar context={`Showing ${MONTH_NAMES[month - 1]} ${year}`}>
        <MonthYearPicker month={month} year={year} onChange={changeMonthYear} />
      </PageToolbar>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expenses by category</CardTitle>
            <CardDescription>
              Where your money went in {MONTH_NAMES[month - 1]} {year}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensesByCategoryChart
              data={expensesByCategory}
              currency={currency}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly spending trend</CardTitle>
            <CardDescription>The last six months of spending.</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlySpendingTrendChart
              data={spendingTrend}
              currency={currency}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget vs actual</CardTitle>
            <CardDescription>
              Planned against spent, per category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetVsActualChart data={budgetVsActual} currency={currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income vs expense</CardTitle>
            <CardDescription>
              What came in against what went out.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeVsExpenseChart data={incomeVsExpense} currency={currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings trend</CardTitle>
            <CardDescription>What you kept each month.</CardDescription>
          </CardHeader>
          <CardContent>
            <SavingsTrendChart data={savingsTrend} currency={currency} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
