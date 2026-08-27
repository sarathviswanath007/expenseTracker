"use client";

import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/shell/page-container";
import {
  MonthYearPicker,
  PageToolbar,
} from "@/components/shell/month-year-picker";
import { MONTH_NAMES } from "@/lib/dates";
import { BudgetOverview } from "@/components/dashboard/budget-overview";
import { QuickAddExpense } from "@/components/dashboard/quick-add-expense";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { GetStartedPanel } from "@/components/dashboard/get-started-panel";
import { IncomeVsExpenseChart } from "@/components/charts/income-vs-expense-chart";
import type { Insight } from "@/lib/insight-rules";
import type { BudgetCategoryRecord } from "@/services/budget.service";
import type { DashboardSummary, IncomeVsExpensePoint } from "@/types/analytics";

export function DashboardView({
  month,
  year,
  summary,
  incomeVsExpense,
  budgetCategories,
  expenseCategories,
  insights,
}: {
  month: number;
  year: number;
  summary: DashboardSummary | null;
  incomeVsExpense: IncomeVsExpensePoint[];
  budgetCategories: BudgetCategoryRecord[];
  expenseCategories: string[];
  insights: Insight[];
}) {
  const router = useRouter();

  function changeMonthYear(nextMonth: number, nextYear: number) {
    router.push(`/dashboard?month=${nextMonth}&year=${nextYear}`);
  }

  if (!summary) {
    return (
      <PageContainer>
        <p className="text-muted-foreground">Log in to view your dashboard.</p>
      </PageContainer>
    );
  }

  const { currency, setup } = summary;
  // A brand-new account gets the setup panel instead of a grid of zeros.
  const isFirstRun = !setup.hasAnyBudget || !setup.hasAnyExpense;

  return (
    <PageContainer>
      <PageToolbar context={`Showing ${MONTH_NAMES[month - 1]} ${year}`}>
        <MonthYearPicker month={month} year={year} onChange={changeMonthYear} />
      </PageToolbar>

      {isFirstRun && <GetStartedPanel setup={setup} />}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <BudgetOverview
          className="lg:col-span-2"
          categories={budgetCategories}
          categoryTotals={summary.categoryTotals}
          currency={currency}
          totalBudget={summary.totalBudget}
          totalExpenses={summary.totalExpenses}
          month={month}
          year={year}
        />
        <QuickAddExpense categories={expenseCategories} currency={currency} />
      </div>

      {!isFirstRun && (
        <InsightsCard
          insights={insights.slice(0, 3)}
          totalCount={insights.length}
        />
      )}

      {!isFirstRun && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div>
            <h2 className="font-medium">Income vs expenses</h2>
            <p className="text-sm text-muted-foreground">
              The last six months, ending {MONTH_NAMES[month - 1]} {year}.
            </p>
          </div>
          <IncomeVsExpenseChart data={incomeVsExpense} currency={currency} />
        </div>
      )}

      {/* Both cards are empty until there is spending to show, and the
          get-started prompt already says what to do about that. */}
      {!isFirstRun && (
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
      )}
    </PageContainer>
  );
}
