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
