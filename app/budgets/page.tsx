import { getBudgetForMonth } from "@/services/budget.service";
import { BudgetManager } from "@/components/budget/budget-manager";

function parseMonthYear(searchParams: Record<string, string | string[] | undefined>) {
  const now = new Date();
  const rawMonth = Array.isArray(searchParams.month)
    ? searchParams.month[0]
    : searchParams.month;
  const rawYear = Array.isArray(searchParams.year)
    ? searchParams.year[0]
    : searchParams.year;

  const month = Number(rawMonth);
  const year = Number(rawYear);

  return {
    month: month >= 1 && month <= 12 ? month : now.getMonth() + 1,
    year: year >= 2000 && year <= 2100 ? year : now.getFullYear(),
  };
}

export default async function BudgetsPage(props: PageProps<"/budgets">) {
  const searchParams = await props.searchParams;
  const { month, year } = parseMonthYear(searchParams);
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
