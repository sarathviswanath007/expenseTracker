import { getBudgetForMonth } from "@/services/budget.service";
import {
  getBudgetVsActual,
  getExpensesByCategory,
  getIncomeVsExpense,
  getMonthlySpendingTrend,
  getSavingsTrend,
} from "@/services/analytics.service";
import { AnalyticsView } from "@/components/analytics/analytics-view";
import { parseMonthYearParams } from "@/lib/dates";

export default async function AnalyticsPage(props: PageProps<"/analytics">) {
  const searchParams = await props.searchParams;
  const { month, year } = parseMonthYearParams(searchParams);

  const [
    budget,
    expensesByCategory,
    budgetVsActual,
    spendingTrend,
    incomeVsExpense,
    savingsTrend,
  ] = await Promise.all([
    getBudgetForMonth(month, year),
    getExpensesByCategory(month, year),
    getBudgetVsActual(month, year),
    getMonthlySpendingTrend(6, month, year),
    getIncomeVsExpense(6, month, year),
    getSavingsTrend(6, month, year),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 sm:p-6">
      <AnalyticsView
        month={month}
        year={year}
        currency={budget?.currency ?? "USD"}
        expensesByCategory={expensesByCategory}
        budgetVsActual={budgetVsActual}
        spendingTrend={spendingTrend}
        incomeVsExpense={incomeVsExpense}
        savingsTrend={savingsTrend}
      />
    </div>
  );
}
