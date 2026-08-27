import {
  getDashboardSummary,
  getIncomeVsExpense,
} from "@/services/analytics.service";
import { getBudgetForMonth } from "@/services/budget.service";
import { getUserCategories } from "@/services/expense.service";
import { getInsights } from "@/services/ai-insights.service";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { parseMonthYearParams } from "@/lib/dates";

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const { month, year } = parseMonthYearParams(searchParams);

  const [summary, incomeVsExpense, budget, expenseCategories, insights] =
    await Promise.all([
      getDashboardSummary(month, year),
      getIncomeVsExpense(6, month, year),
      getBudgetForMonth(month, year),
      getUserCategories(),
      getInsights(month, year),
    ]);

  return (
    <DashboardView
      month={month}
      year={year}
      summary={summary}
      incomeVsExpense={incomeVsExpense}
      budgetCategories={budget?.categories ?? []}
      expenseCategories={expenseCategories}
      insights={insights?.insights ?? []}
    />
  );
}
