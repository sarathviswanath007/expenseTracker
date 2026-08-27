"use server";

import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { getBudgetForMonth } from "@/services/budget.service";
import { MONTH_NAMES } from "@/lib/dates";
import type { ExportSheet } from "@/lib/export-format";
import type { Currency } from "@/types/budget";

export type ExportKind = "expenses" | "budget" | "summary";

export interface MonthlyReport {
  currency: Currency;
  month: number;
  year: number;
  sheets: ExportSheet[];
}

function monthRange(month: number, year: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

/**
 * Amounts go out as raw numbers, not formatted currency, so the columns stay
 * sortable and summable in a spreadsheet. The currency is stated once in the
 * summary sheet and in the column heading instead.
 */
export async function getMonthlyReport(
  month: number,
  year: number,
  kinds: ExportKind[],
): Promise<MonthlyReport | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { start, end } = monthRange(month, year);

  const [budget, { data: expenseRows, error: expenseError }, incomeTotal] =
    await Promise.all([
      getBudgetForMonth(month, year),
      supabase
        .from("expenses")
        .select("expense_date, category, amount, payment_method, description")
        .eq("user_id", user.id)
        .gte("expense_date", start)
        .lte("expense_date", end)
        .order("expense_date", { ascending: true }),
      totalIncomeForMonth(supabase, user.id, month, year),
    ]);
  if (expenseError) throw new Error(expenseError.message);

  const currency = budget?.currency ?? "USD";
  const expenses = expenseRows ?? [];

  const spentByCategory = new Map<string, number>();
  for (const row of expenses) {
    spentByCategory.set(
      row.category,
      (spentByCategory.get(row.category) ?? 0) + Number(row.amount),
    );
  }
  const totalSpent = Array.from(spentByCategory.values()).reduce(
    (sum, value) => sum + value,
    0,
  );
  const totalBudget = budget?.totalBudget ?? 0;

  const sheets: ExportSheet[] = [];

  if (kinds.includes("summary")) {
    sheets.push({
      name: "Summary",
      columns: ["Measure", `Amount (${currency})`],
      rows: [
        ["Month", `${MONTH_NAMES[month - 1]} ${year}`],
        ["Income", incomeTotal],
        ["Expenses", totalSpent],
        ["Savings", incomeTotal - totalSpent],
        ["Savings target", budget?.savingsTarget ?? 0],
        ["Budgeted", totalBudget],
        ["Remaining budget", totalBudget - totalSpent],
        ["Expenses recorded", expenses.length],
      ],
    });
  }

  if (kinds.includes("budget")) {
    sheets.push({
      name: "Budget",
      columns: [
        "Category",
        `Budgeted (${currency})`,
        `Spent (${currency})`,
        `Remaining (${currency})`,
        "Used %",
        "Alert at %",
      ],
      rows: (budget?.categories ?? []).map((category) => {
        const spent = spentByCategory.get(category.category) ?? 0;
        const used =
          category.allocatedAmount > 0
            ? Math.round((spent / category.allocatedAmount) * 1000) / 10
            : 0;
        return [
          category.category,
          category.allocatedAmount,
          spent,
          category.allocatedAmount - spent,
          used,
          category.alertThresholdPercent,
        ];
      }),
    });
  }

  if (kinds.includes("expenses")) {
    sheets.push({
      name: "Expenses",
      columns: [
        "Date",
        "Category",
        `Amount (${currency})`,
        "Payment method",
        "Description",
      ],
      rows: expenses.map((row) => [
        row.expense_date,
        row.category,
        Number(row.amount),
        row.payment_method,
        row.description ?? "",
      ]),
    });
  }

  return { currency, month, year, sheets };
}

async function totalIncomeForMonth(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  month: number,
  year: number,
): Promise<number> {
  const { data, error } = await supabase
    .from("income")
    .select("amount, is_recurring, income_date")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);

  const { start, end } = monthRange(month, year);
  const startDate = new Date(start);
  const endDate = new Date(end);

  return (data ?? []).reduce((sum, row) => {
    const rowDate = new Date(row.income_date);
    const included = row.is_recurring
      ? rowDate <= endDate
      : rowDate >= startDate && rowDate <= endDate;
    return included ? sum + Number(row.amount) : sum;
  }, 0);
}
