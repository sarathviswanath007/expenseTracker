"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { DEFAULT_CATEGORIES, type PaymentMethod } from "@/lib/categories";
import type { Expense } from "@/types/expense";

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

function mapExpense(row: {
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

export async function getUserCategories(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_CATEGORIES;

  const { data: budgets, error: budgetsError } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id);
  if (budgetsError) throw new Error(budgetsError.message);

  const budgetIds = (budgets ?? []).map((b) => b.id);
  if (budgetIds.length === 0) return DEFAULT_CATEGORIES;

  const { data: categories, error: categoriesError } = await supabase
    .from("budget_categories")
    .select("category")
    .in("budget_id", budgetIds);
  if (categoriesError) throw new Error(categoriesError.message);

  const distinct = Array.from(
    new Set((categories ?? []).map((c) => c.category)),
  ).sort();

  return distinct.length > 0 ? distinct : DEFAULT_CATEGORIES;
}

export interface ExpenseFilters {
  category?: string;
  from?: string;
  to?: string;
  search?: string;
  page: number;
  pageSize: number;
}

export interface ExpenseListResult {
  expenses: Expense[];
  total: number;
}

export async function listExpenses(
  filters: ExpenseFilters,
): Promise<ExpenseListResult> {
  const { supabase, user } = await requireUser();

  let query = supabase
    .from("expenses")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.from) {
    query = query.gte("expense_date", filters.from);
  }
  if (filters.to) {
    query = query.lte("expense_date", filters.to);
  }
  if (filters.search) {
    query = query.ilike("description", `%${filters.search}%`);
  }

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  const { data, error, count } = await query
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);

  return {
    expenses: (data ?? []).map(mapExpense),
    total: count ?? 0,
  };
}

export interface ExpenseInput {
  category: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description: string | null;
}

export async function createExpense(input: ExpenseInput) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    category: input.category,
    amount: input.amount,
    expense_date: input.date,
    payment_method: input.paymentMethod,
    description: input.description,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function updateExpense(id: string, input: ExpenseInput) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("expenses")
    .update({
      category: input.category,
      amount: input.amount,
      expense_date: input.date,
      payment_method: input.paymentMethod,
      description: input.description,
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function deleteExpense(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
