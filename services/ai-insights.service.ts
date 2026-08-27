"use server";

import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { getBudgetForMonth } from "@/services/budget.service";
import {
  generateInsights,
  type Insight,
  type PaymentMethodTotal,
} from "@/lib/insight-rules";
import type { CategoryTotal } from "@/lib/dashboard-math";
import type { Currency } from "@/types/budget";

/** How many earlier months the "vs your average" rules compare against. */
const HISTORY_MONTHS = 3;

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

function monthRange(month: number, year: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

async function getMonthExpenses(
  supabase: SupabaseServerClient,
  userId: string,
  month: number,
  year: number,
) {
  const { start, end } = monthRange(month, year);
  const { data, error } = await supabase
    .from("expenses")
    .select("category, amount, payment_method")
    .eq("user_id", userId)
    .gte("expense_date", start)
    .lte("expense_date", end);
  if (error) throw new Error(error.message);
  return data ?? [];
}

function toCategoryTotals(
  rows: { category: string; amount: number | string }[],
): CategoryTotal[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.category, (map.get(row.category) ?? 0) + Number(row.amount));
  }
  return Array.from(map, ([category, amount]) => ({ category, amount }));
}

function toPaymentTotals(
  rows: { payment_method: string; amount: number | string }[],
): PaymentMethodTotal[] {
  const map = new Map<string, { count: number; amount: number }>();
  for (const row of rows) {
    const current = map.get(row.payment_method) ?? { count: 0, amount: 0 };
    map.set(row.payment_method, {
      count: current.count + 1,
      amount: current.amount + Number(row.amount),
    });
  }
  return Array.from(map, ([paymentMethod, totals]) => ({
    paymentMethod,
    ...totals,
  }));
}

async function getTotalIncomeForMonth(
  supabase: SupabaseServerClient,
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

export interface InsightsResult {
  insights: Insight[];
  currency: Currency;
  hasBudget: boolean;
  hasExpenses: boolean;
}

/**
 * Rule-based insights for one month. Deterministic: every statement is
 * derived from the user's own budgets, expenses, and income.
 */
export async function getInsights(
  month: number,
  year: number,
): Promise<InsightsResult | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const historyMonths = Array.from({ length: HISTORY_MONTHS }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 2 - index, 1));
    return { month: date.getUTCMonth() + 1, year: date.getUTCFullYear() };
  });

  const [budget, currentRows, totalIncome, historyRows] = await Promise.all([
    getBudgetForMonth(month, year),
    getMonthExpenses(supabase, user.id, month, year),
    getTotalIncomeForMonth(supabase, user.id, month, year),
    Promise.all(
      historyMonths.map((point) =>
        getMonthExpenses(supabase, user.id, point.month, point.year),
      ),
    ),
  ]);

  const currentTotals = toCategoryTotals(currentRows);
  const totalExpenses = currentTotals.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );

  // Months with no expenses at all would drag every average toward zero and
  // manufacture "spending is up" insights, so they're left out.
  const populatedHistory = historyRows.filter((rows) => rows.length > 0);

  const insights = generateInsights({
    currency: budget?.currency ?? "USD",
    month,
    year,
    totalIncome,
    totalExpenses,
    savingsTarget: budget?.savingsTarget ?? 0,
    budgetCategories: (budget?.categories ?? []).map((category) => ({
      category: category.category,
      allocatedAmount: category.allocatedAmount,
      alertThresholdPercent: category.alertThresholdPercent,
    })),
    currentTotals,
    historyTotals: populatedHistory.map(toCategoryTotals),
    historyExpenseTotals: populatedHistory.map((rows) =>
      rows.reduce((sum, row) => sum + Number(row.amount), 0),
    ),
    paymentTotals: toPaymentTotals(currentRows),
  });

  return {
    insights,
    currency: budget?.currency ?? "USD",
    hasBudget: Boolean(budget && budget.categories.length > 0),
    hasExpenses: currentRows.length > 0,
  };
}
