"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { getBudgetForMonth } from "@/services/budget.service";
import { getSavingsTrend } from "@/services/analytics.service";
import { monthlySavingsRate } from "@/lib/goal-math";
import type { Currency } from "@/types/budget";

export type GoalStatus = "active" | "achieved" | "archived";

export interface GoalInput {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
}

export interface GoalRecord extends GoalInput {
  id: string;
  status: GoalStatus;
}

export interface GoalsResult {
  goals: GoalRecord[];
  currency: Currency;
  /** Average of recent months that ended in surplus. Drives projections. */
  monthlyRate: number;
  /** How many months of history the rate is averaged over. */
  monthsOfHistory: number;
}

/** Months of savings history the projection rate is averaged over. */
const RATE_WINDOW = 6;

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  return { supabase, user };
}

export async function getGoals(): Promise<GoalsResult | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [{ data, error }, budget, savingsTrend] = await Promise.all([
    supabase
      .from("financial_goals")
      .select("id, name, target_amount, current_amount, target_date, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    getBudgetForMonth(month, year),
    getSavingsTrend(RATE_WINDOW, month, year),
  ]);
  if (error) throw new Error(error.message);

  const positiveMonths = savingsTrend
    .map((point) => point.savings)
    .filter((value) => value > 0);

  return {
    goals: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      targetAmount: Number(row.target_amount),
      currentAmount: Number(row.current_amount),
      targetDate: row.target_date,
      status: row.status as GoalStatus,
    })),
    currency: budget?.currency ?? "USD",
    monthlyRate: monthlySavingsRate(savingsTrend.map((point) => point.savings)),
    monthsOfHistory: positiveMonths.length,
  };
}

export async function createGoal(input: GoalInput) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("financial_goals").insert({
    user_id: user.id,
    name: input.name,
    target_amount: input.targetAmount,
    current_amount: input.currentAmount,
    target_date: input.targetDate,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/goals");
}

export async function updateGoal(id: string, input: Partial<GoalInput>) {
  const { supabase, user } = await requireUser();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.targetAmount !== undefined) patch.target_amount = input.targetAmount;
  if (input.currentAmount !== undefined)
    patch.current_amount = input.currentAmount;
  if (input.targetDate !== undefined) patch.target_date = input.targetDate;

  const { error } = await supabase
    .from("financial_goals")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/goals");
}

export async function setGoalStatus(id: string, status: GoalStatus) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("financial_goals")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/goals");
}

export async function deleteGoal(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("financial_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/goals");
}
