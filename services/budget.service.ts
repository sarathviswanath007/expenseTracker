"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import type { Currency } from "@/types/budget";

export interface OnboardingIncomeInput {
  source: string;
  amount: number;
  isRecurring: boolean;
}

export interface OnboardingCategoryInput {
  category: string;
  allocatedAmount: number;
}

export interface CompleteOnboardingInput {
  income: OnboardingIncomeInput[];
  goals: string[];
  currency: Currency;
  savingsTarget: number;
  categories: OnboardingCategoryInput[];
}

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

export async function getOnboardingStatus() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { completed: false, goals: [] as string[], userId: null };
  }

  const { month, year } = currentMonthYear();

  const [{ data: budget }, { data: profile }] = await Promise.all([
    supabase
      .from("budgets")
      .select("id")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle(),
    supabase.from("users").select("goals").eq("id", user.id).maybeSingle(),
  ]);

  return {
    completed: Boolean(budget),
    goals: (profile?.goals as string[] | null) ?? [],
    userId: user.id,
  };
}

export async function completeOnboarding(input: CompleteOnboardingInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to complete onboarding.");
  }

  const { month, year } = currentMonthYear();

  if (input.income.length > 0) {
    const { error: incomeError } = await supabase.from("income").insert(
      input.income.map((entry) => ({
        user_id: user.id,
        amount: entry.amount,
        source: entry.source,
        is_recurring: entry.isRecurring,
      })),
    );
    if (incomeError) throw new Error(incomeError.message);
  }

  const { error: goalsError } = await supabase
    .from("users")
    .update({ goals: input.goals })
    .eq("id", user.id);
  if (goalsError) throw new Error(goalsError.message);

  const totalBudget = input.categories.reduce(
    (sum, category) => sum + category.allocatedAmount,
    0,
  );

  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      month,
      year,
      currency: input.currency,
      total_budget: totalBudget,
      savings_target: input.savingsTarget,
    })
    .select("id")
    .single();
  if (budgetError) throw new Error(budgetError.message);

  if (input.categories.length > 0) {
    const { error: categoriesError } = await supabase
      .from("budget_categories")
      .insert(
        input.categories.map((category) => ({
          budget_id: budget.id,
          category: category.category,
          allocated_amount: category.allocatedAmount,
        })),
      );
    if (categoriesError) throw new Error(categoriesError.message);
  }

  revalidatePath("/dashboard");
}

export interface BudgetCategoryRecord {
  id: string;
  category: string;
  allocatedAmount: number;
  alertThresholdPercent: number;
}

export interface BudgetWithCategories {
  id: string;
  month: number;
  year: number;
  currency: Currency;
  totalBudget: number;
  savingsTarget: number;
  categories: BudgetCategoryRecord[];
}

export async function getBudgetForMonth(
  month: number,
  year: number,
): Promise<BudgetWithCategories | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: budget, error } = await supabase
    .from("budgets")
    .select("id, month, year, currency, total_budget, savings_target")
    .eq("user_id", user.id)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!budget) return null;

  const { data: categories, error: categoriesError } = await supabase
    .from("budget_categories")
    .select("id, category, allocated_amount, alert_threshold_percent")
    .eq("budget_id", budget.id)
    .order("category");
  if (categoriesError) throw new Error(categoriesError.message);

  return {
    id: budget.id,
    month: budget.month,
    year: budget.year,
    currency: budget.currency as Currency,
    totalBudget: Number(budget.total_budget),
    savingsTarget: Number(budget.savings_target),
    categories: (categories ?? []).map((c) => ({
      id: c.id,
      category: c.category,
      allocatedAmount: Number(c.allocated_amount),
      alertThresholdPercent: c.alert_threshold_percent,
    })),
  };
}

export interface SaveBudgetCategoryInput {
  id?: string;
  category: string;
  allocatedAmount: number;
  alertThresholdPercent: number;
}

export interface SaveBudgetInput {
  budgetId?: string;
  month: number;
  year: number;
  currency: Currency;
  savingsTarget: number;
  categories: SaveBudgetCategoryInput[];
}

export async function saveBudget(input: SaveBudgetInput) {
  const { supabase, user } = await requireUser();

  const totalBudget = input.categories.reduce(
    (sum, category) => sum + category.allocatedAmount,
    0,
  );

  let budgetId = input.budgetId;

  if (budgetId) {
    const { error } = await supabase
      .from("budgets")
      .update({
        currency: input.currency,
        total_budget: totalBudget,
        savings_target: input.savingsTarget,
      })
      .eq("id", budgetId)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        month: input.month,
        year: input.year,
        currency: input.currency,
        total_budget: totalBudget,
        savings_target: input.savingsTarget,
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("A budget already exists for that month.");
      }
      throw new Error(error.message);
    }
    budgetId = data.id;
  }

  const { data: existingCategories, error: existingError } = await supabase
    .from("budget_categories")
    .select("id")
    .eq("budget_id", budgetId);
  if (existingError) throw new Error(existingError.message);

  const keptIds = new Set(
    input.categories.filter((c) => c.id).map((c) => c.id as string),
  );
  const idsToDelete = (existingCategories ?? [])
    .map((c) => c.id)
    .filter((id) => !keptIds.has(id));

  if (idsToDelete.length > 0) {
    const { error } = await supabase
      .from("budget_categories")
      .delete()
      .in("id", idsToDelete);
    if (error) throw new Error(error.message);
  }

  for (const category of input.categories.filter((c) => c.id)) {
    const { error } = await supabase
      .from("budget_categories")
      .update({
        category: category.category,
        allocated_amount: category.allocatedAmount,
        alert_threshold_percent: category.alertThresholdPercent,
      })
      .eq("id", category.id);
    if (error) throw new Error(error.message);
  }

  const toInsert = input.categories.filter((c) => !c.id);
  if (toInsert.length > 0) {
    const { error } = await supabase.from("budget_categories").insert(
      toInsert.map((category) => ({
        budget_id: budgetId,
        category: category.category,
        allocated_amount: category.allocatedAmount,
        alert_threshold_percent: category.alertThresholdPercent,
      })),
    );
    if (error) throw new Error(error.message);
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { budgetId };
}

export async function deleteBudget(budgetId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", budgetId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export async function copyPreviousMonthBudget(month: number, year: number) {
  const { supabase, user } = await requireUser();

  const { data: existing, error: existingError } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing) {
    throw new Error("This month already has a budget.");
  }

  const { data: candidates, error: candidatesError } = await supabase
    .from("budgets")
    .select("id, month, year, currency, savings_target")
    .eq("user_id", user.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false });
  if (candidatesError) throw new Error(candidatesError.message);

  const previous = (candidates ?? []).find(
    (b) => b.year < year || (b.year === year && b.month < month),
  );
  if (!previous) {
    throw new Error("There's no previous budget to copy from.");
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("budget_categories")
    .select("category, allocated_amount, alert_threshold_percent")
    .eq("budget_id", previous.id);
  if (categoriesError) throw new Error(categoriesError.message);

  const totalBudget = (categories ?? []).reduce(
    (sum, c) => sum + Number(c.allocated_amount),
    0,
  );

  const { data: newBudget, error: insertError } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      month,
      year,
      currency: previous.currency,
      total_budget: totalBudget,
      savings_target: previous.savings_target,
    })
    .select("id")
    .single();
  if (insertError) throw new Error(insertError.message);

  if (categories && categories.length > 0) {
    const { error: categoryInsertError } = await supabase
      .from("budget_categories")
      .insert(
        categories.map((c) => ({
          budget_id: newBudget.id,
          category: c.category,
          allocated_amount: c.allocated_amount,
          alert_threshold_percent: c.alert_threshold_percent,
        })),
      );
    if (categoryInsertError) throw new Error(categoryInsertError.message);
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export interface IncomeInput {
  source: string;
  amount: number;
  isRecurring: boolean;
  incomeDate: string;
}

export interface IncomeRecord extends IncomeInput {
  id: string;
}

/** Every income row on the account, newest first. */
export async function listIncome(): Promise<IncomeRecord[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("income")
    .select("id, source, amount, is_recurring, income_date")
    .eq("user_id", user.id)
    .order("income_date", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    source: row.source ?? "",
    amount: Number(row.amount),
    isRecurring: row.is_recurring,
    incomeDate: row.income_date,
  }));
}

export async function createIncome(input: IncomeInput) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("income").insert({
    user_id: user.id,
    source: input.source,
    amount: input.amount,
    is_recurring: input.isRecurring,
    income_date: input.incomeDate,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export async function updateIncome(id: string, input: IncomeInput) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("income")
    .update({
      source: input.source,
      amount: input.amount,
      is_recurring: input.isRecurring,
      income_date: input.incomeDate,
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export async function deleteIncome(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("income")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}
