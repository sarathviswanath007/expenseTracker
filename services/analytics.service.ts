"use server";

import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { getCategoryAlertStatus } from "@/lib/budget-alerts";
import {
  calculateRemainingBudget,
  calculateSavings,
  calculatePercentChange,
  calculateUtilizationPercent,
  findTopCategory,
  type CategoryTotal,
} from "@/lib/dashboard-math";
import { getBudgetForMonth } from "@/services/budget.service";
import type {
  BudgetVsActualPoint,
  CategoryAlert,
  CategoryChange,
  DashboardSummary,
  IncomeVsExpensePoint,
  MonthPoint,
  SavingsTrendPoint,
  SpendingTrendPoint,
} from "@/types/analytics";
import type { PaymentMethod } from "@/lib/categories";
import type { Expense } from "@/types/expense";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

function currentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be logged in.");
  }
  return { supabase, user };
}

function monthRange(month: number, year: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function sameMonth(dateStr: string, month: number, year: number) {
  const d = new Date(dateStr);
  return d.getUTCMonth() + 1 === month && d.getUTCFullYear() === year;
}

function monthsBackList(
  monthsBack: number,
  refMonth: number,
  refYear: number,
): MonthPoint[] {
  const points: MonthPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(refYear, refMonth - 1 - i, 1));
    points.push({
      month: d.getUTCMonth() + 1,
      year: d.getUTCFullYear(),
      label: d.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
    });
  }
  return points;
}

async function getCategoryTotals(
  supabase: SupabaseServerClient,
  userId: string,
  start: string,
  end: string,
): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("expenses")
    .select("category, amount")
    .eq("user_id", userId)
    .gte("expense_date", start)
    .lte("expense_date", end);
  if (error) throw new Error(error.message);

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    map.set(row.category, (map.get(row.category) ?? 0) + Number(row.amount));
  }
  return map;
}

function mapExpenseRow(row: {
  id: string;
  user_id: string;
  category: string;
  amount: number | string;
  description: string | null;
  expense_date: string;
  payment_method: string;
  created_at: string;
}): Expense {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    amount: Number(row.amount),
    description: row.description,
    expenseDate: row.expense_date,
    paymentMethod: row.payment_method as PaymentMethod,
    createdAt: row.created_at,
  };
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

export async function getDashboardSummary(
  month: number,
  year: number,
): Promise<DashboardSummary | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { start, end } = monthRange(month, year);
  const prev = new Date(Date.UTC(year, month - 2, 1));
  const prevMonth = prev.getUTCMonth() + 1;
  const prevYear = prev.getUTCFullYear();
  const prevRange = monthRange(prevMonth, prevYear);

  const [
    budget,
    categoryTotalsMap,
    totalIncome,
    { data: recentRows, error: recentError },
    prevCategoryTotalsMap,
    prevTotalIncome,
  ] = await Promise.all([
    getBudgetForMonth(month, year),
    getCategoryTotals(supabase, user.id, start, end),
    getTotalIncomeForMonth(supabase, user.id, month, year),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("expense_date", start)
      .lte("expense_date", end)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
    getCategoryTotals(supabase, user.id, prevRange.start, prevRange.end),
    getTotalIncomeForMonth(supabase, user.id, prevMonth, prevYear),
  ]);
  if (recentError) throw new Error(recentError.message);

  const prevTotalExpenses = Array.from(prevCategoryTotalsMap.values()).reduce(
    (sum, amount) => sum + amount,
    0,
  );

  const categoryTotals: CategoryTotal[] = Array.from(
    categoryTotalsMap,
    ([category, amount]) => ({ category, amount }),
  );
  const totalExpenses = categoryTotals.reduce((sum, c) => sum + c.amount, 0);
  const totalBudget = budget?.totalBudget ?? 0;

  const alerts: CategoryAlert[] = (budget?.categories ?? [])
    .map((c) => {
      const spent = categoryTotalsMap.get(c.category) ?? 0;
      return {
        category: c.category,
        amount: spent,
        allocatedAmount: c.allocatedAmount,
        status: getCategoryAlertStatus(
          spent,
          c.allocatedAmount,
          c.alertThresholdPercent,
        ),
      };
    })
    .filter((a) => a.status !== "ok");

  const totalSavings = calculateSavings(totalIncome, totalExpenses);
  const prevTotalSavings = calculateSavings(prevTotalIncome, prevTotalExpenses);

  const categoryChanges: CategoryChange[] = categoryTotals
    .map((c) => {
      const previousAmount = prevCategoryTotalsMap.get(c.category) ?? 0;
      return {
        category: c.category,
        amount: c.amount,
        previousAmount,
        percentChange: calculatePercentChange(c.amount, previousAmount),
      };
    })
    .filter((c) => c.percentChange !== null)
    .sort(
      (a, b) => Math.abs(b.percentChange!) - Math.abs(a.percentChange!),
    );

  return {
    currency: budget?.currency ?? "USD",
    totalIncome,
    totalExpenses,
    totalSavings,
    totalBudget,
    remainingBudget: calculateRemainingBudget(totalBudget, totalExpenses),
    utilizationPercent: calculateUtilizationPercent(totalExpenses, totalBudget),
    topCategory: findTopCategory(categoryTotals),
    categoryTotals,
    alerts,
    recentTransactions: (recentRows ?? []).map(mapExpenseRow),
    categoryChanges,
    previousMonth: {
      totalIncome: prevTotalIncome,
      totalExpenses: prevTotalExpenses,
      totalSavings: prevTotalSavings,
      hasData: prevTotalIncome > 0 || prevTotalExpenses > 0,
    },
  };
}

export async function getExpensesByCategory(
  month: number,
  year: number,
): Promise<CategoryTotal[]> {
  const { supabase, user } = await requireUser();
  const { start, end } = monthRange(month, year);
  const map = await getCategoryTotals(supabase, user.id, start, end);
  return Array.from(map, ([category, amount]) => ({ category, amount }));
}

export async function getBudgetVsActual(
  month: number,
  year: number,
): Promise<BudgetVsActualPoint[]> {
  const { supabase, user } = await requireUser();
  const budget = await getBudgetForMonth(month, year);
  if (!budget) return [];

  const { start, end } = monthRange(month, year);
  const map = await getCategoryTotals(supabase, user.id, start, end);

  return budget.categories.map((c) => ({
    category: c.category,
    planned: c.allocatedAmount,
    actual: map.get(c.category) ?? 0,
  }));
}

export async function getMonthlySpendingTrend(
  monthsBack = 6,
  refMonth?: number,
  refYear?: number,
): Promise<SpendingTrendPoint[]> {
  const { supabase, user } = await requireUser();
  const ref = refMonth && refYear ? { month: refMonth, year: refYear } : currentMonthYear();
  const points = monthsBackList(monthsBack, ref.month, ref.year);
  const rangeStart = monthRange(points[0].month, points[0].year).start;
  const rangeEnd = monthRange(
    points[points.length - 1].month,
    points[points.length - 1].year,
  ).end;

  const { data, error } = await supabase
    .from("expenses")
    .select("amount, expense_date")
    .eq("user_id", user.id)
    .gte("expense_date", rangeStart)
    .lte("expense_date", rangeEnd);
  if (error) throw new Error(error.message);

  return points.map((p) => ({
    ...p,
    total: (data ?? [])
      .filter((row) => sameMonth(row.expense_date, p.month, p.year))
      .reduce((sum, row) => sum + Number(row.amount), 0),
  }));
}

export async function getIncomeVsExpense(
  monthsBack = 6,
  refMonth?: number,
  refYear?: number,
): Promise<IncomeVsExpensePoint[]> {
  const { supabase, user } = await requireUser();
  const ref = refMonth && refYear ? { month: refMonth, year: refYear } : currentMonthYear();
  const points = monthsBackList(monthsBack, ref.month, ref.year);
  const rangeStart = monthRange(points[0].month, points[0].year).start;
  const rangeEnd = monthRange(
    points[points.length - 1].month,
    points[points.length - 1].year,
  ).end;

  const [{ data: expenseRows, error: expenseError }, { data: incomeRows, error: incomeError }] =
    await Promise.all([
      supabase
        .from("expenses")
        .select("amount, expense_date")
        .eq("user_id", user.id)
        .gte("expense_date", rangeStart)
        .lte("expense_date", rangeEnd),
      supabase
        .from("income")
        .select("amount, is_recurring, income_date")
        .eq("user_id", user.id),
    ]);
  if (expenseError) throw new Error(expenseError.message);
  if (incomeError) throw new Error(incomeError.message);

  return points.map((p) => {
    const { start, end } = monthRange(p.month, p.year);
    const startDate = new Date(start);
    const endDate = new Date(end);

    const income = (incomeRows ?? []).reduce((sum, row) => {
      const rowDate = new Date(row.income_date);
      const included = row.is_recurring
        ? rowDate <= endDate
        : rowDate >= startDate && rowDate <= endDate;
      return included ? sum + Number(row.amount) : sum;
    }, 0);

    const expense = (expenseRows ?? [])
      .filter((row) => sameMonth(row.expense_date, p.month, p.year))
      .reduce((sum, row) => sum + Number(row.amount), 0);

    return { ...p, income, expense };
  });
}

export async function getSavingsTrend(
  monthsBack = 6,
  refMonth?: number,
  refYear?: number,
): Promise<SavingsTrendPoint[]> {
  const points = await getIncomeVsExpense(monthsBack, refMonth, refYear);
  return points.map((p) => ({
    month: p.month,
    year: p.year,
    label: p.label,
    savings: calculateSavings(p.income, p.expense),
  }));
}
