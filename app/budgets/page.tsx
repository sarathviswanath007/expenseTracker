import { getBudgetForMonth } from "@/services/budget.service";
import { BudgetManager } from "@/components/budget/budget-manager";
import { parseMonthYearParams } from "@/lib/dates";

export default async function BudgetsPage(props: PageProps<"/budgets">) {
  const searchParams = await props.searchParams;
  const { month, year } = parseMonthYearParams(searchParams);
  const budget = await getBudgetForMonth(month, year);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-6">
      <BudgetManager
        key={`${year}-${month}-${budget?.id ?? "new"}`}
        month={month}
        year={year}
        budget={budget}
      />
    </div>
  );
}
