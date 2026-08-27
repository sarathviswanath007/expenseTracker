import { getBudgetForMonth, listIncome } from "@/services/budget.service";
import { BudgetManager } from "@/components/budget/budget-manager";
import { parseMonthYearParams } from "@/lib/dates";

export default async function BudgetsPage(props: PageProps<"/budgets">) {
  const searchParams = await props.searchParams;
  const { month, year } = parseMonthYearParams(searchParams);
  const [budget, income] = await Promise.all([
    getBudgetForMonth(month, year),
    listIncome(),
  ]);

  return (
    <BudgetManager
      key={`${year}-${month}-${budget?.id ?? "new"}`}
      month={month}
      year={year}
      budget={budget}
      income={income}
    />
  );
}
