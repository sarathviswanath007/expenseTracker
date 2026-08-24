import {
  getDashboardSummary,
  getIncomeVsExpense,
} from "@/services/analytics.service";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { parseMonthYearParams } from "@/lib/dates";

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const { month, year } = parseMonthYearParams(searchParams);

  const [summary, incomeVsExpense] = await Promise.all([
    getDashboardSummary(month, year),
    getIncomeVsExpense(6, month, year),
  ]);

  return (
    <DashboardView
      month={month}
      year={year}
      summary={summary}
      incomeVsExpense={incomeVsExpense}
    />
  );
}
