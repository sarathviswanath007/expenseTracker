import { getUserCategories, listExpenses } from "@/services/expense.service";
import { getBudgetForMonth } from "@/services/budget.service";
import { ExpenseManager } from "@/components/expenses/expense-manager";

const PAGE_SIZE = 10;

function param(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function ExpensesPage(props: PageProps<"/expenses">) {
  const searchParams = await props.searchParams;

  const category = param(searchParams, "category") || undefined;
  const from = param(searchParams, "from") || undefined;
  const to = param(searchParams, "to") || undefined;
  const search = param(searchParams, "search") || undefined;
  const page = Math.max(1, Number(param(searchParams, "page")) || 1);

  const now = new Date();
  const [categories, result, budget] = await Promise.all([
    getUserCategories(),
    listExpenses({ category, from, to, search, page, pageSize: PAGE_SIZE }),
    getBudgetForMonth(now.getMonth() + 1, now.getFullYear()),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 sm:p-6">
      <ExpenseManager
        categories={categories}
        expenses={result.expenses}
        total={result.total}
        pageSize={PAGE_SIZE}
        page={page}
        filters={{ category, from, to, search }}
        currency={budget?.currency ?? "USD"}
      />
    </div>
  );
}
