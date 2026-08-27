"use server";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { getBudgetForMonth } from "@/services/budget.service";
import { formatCurrency } from "@/lib/format-currency";
import { MONTH_NAMES } from "@/lib/dates";
import type { Currency } from "@/types/budget";

const MODEL = "claude-opus-5";
const HISTORY_MONTHS = 3;

const RecommendationSchema = z.object({
  category: z
    .string()
    .describe("The budget category this recommendation is about."),
  headline: z
    .string()
    .describe("One short imperative sentence, e.g. 'Cut Food by ₹3,000'."),
  rationale: z
    .string()
    .describe(
      "Two sentences at most, quoting the figures from the data that justify it.",
    ),
  suggestedMonthlyChange: z
    .number()
    .describe(
      "Amount to reduce next month's budget by, in the user's currency. Positive number. 0 if the advice isn't a budget cut.",
    ),
  difficulty: z
    .enum(["easy", "moderate", "hard"])
    .describe("How disruptive this change is likely to feel."),
});

const AdviceSchema = z.object({
  summary: z
    .string()
    .describe(
      "Two or three sentences on the overall spending pattern this month.",
    ),
  recommendations: z
    .array(RecommendationSchema)
    .describe("Between one and four recommendations, most valuable first."),
  projectedMonthlySaving: z
    .number()
    .describe("Sum of the suggested changes, in the user's currency."),
});

export type OptimizationAdvice = z.infer<typeof AdviceSchema>;

export type AdviceResult =
  | { status: "ok"; advice: OptimizationAdvice; generatedAt: string }
  | { status: "not-configured" }
  | { status: "no-data"; message: string }
  | { status: "error"; message: string };

const SYSTEM_PROMPT = `You are the financial coach inside BudgetWise AI, a personal budgeting app.

You are given one month of a single user's own budget and spending figures. Your job is to tell them where to optimise NEXT month.

Rules you must follow:
- Every claim must be grounded in the numbers provided. Never invent a figure, a category, or a trend.
- Quote the actual amounts when you justify a recommendation.
- Recommend changes to spending and budget allocations only. Do not recommend specific investments, securities, or financial products, and do not give investment advice.
- Prefer categories where the data shows real headroom: consistent overspending, a spike against the recent average, or an allocation far larger than what is actually spent.
- Do not recommend cutting a category to less than what the user actually spends on it, and be careful with essentials like rent, bills, and loan or salary payments — say so plainly if the only headroom is in an essential.
- If the data is too thin to say anything useful, say that in the summary and return no recommendations.
- Be specific and brief. No preamble, no hedging, no motivational filler.`;

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

async function monthTotals(
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

  const byCategory = new Map<string, number>();
  const byPaymentMethod = new Map<string, { count: number; amount: number }>();
  for (const row of data ?? []) {
    const amount = Number(row.amount);
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + amount);
    const payment = byPaymentMethod.get(row.payment_method) ?? {
      count: 0,
      amount: 0,
    };
    byPaymentMethod.set(row.payment_method, {
      count: payment.count + 1,
      amount: payment.amount + amount,
    });
  }
  return { byCategory, byPaymentMethod, rowCount: (data ?? []).length };
}

async function totalIncome(
  supabase: SupabaseServerClient,
  userId: string,
  month: number,
  year: number,
) {
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

/**
 * Builds the figures the model is allowed to reason about. Everything is
 * pre-aggregated — no descriptions, no dates, no row-level data leaves here.
 */
function buildFacts(params: {
  currency: Currency;
  month: number;
  year: number;
  income: number;
  savingsTarget: number;
  categories: { category: string; allocatedAmount: number }[];
  current: Map<string, number>;
  history: Map<string, number>[];
  payments: Map<string, { count: number; amount: number }>;
}): string {
  const {
    currency,
    month,
    year,
    income,
    savingsTarget,
    categories,
    current,
    history,
    payments,
  } = params;
  const money = (value: number) => formatCurrency(value, currency);

  const names = new Set([
    ...categories.map((c) => c.category),
    ...current.keys(),
    ...history.flatMap((map) => Array.from(map.keys())),
  ]);

  const rows = Array.from(names).map((name) => {
    const allocated =
      categories.find((c) => c.category === name)?.allocatedAmount ?? 0;
    const spent = current.get(name) ?? 0;
    const past = history.map((map) => map.get(name) ?? 0);
    const priorAverage =
      past.length > 0 ? past.reduce((a, b) => a + b, 0) / past.length : 0;
    return `- ${name}: budgeted ${money(allocated)}, spent ${money(spent)} this month, averaged ${money(priorAverage)} over the previous ${past.length} month(s)`;
  });

  const paymentRows = Array.from(payments, ([method, totals]) => {
    return `- ${method}: ${totals.count} purchases totalling ${money(totals.amount)}`;
  });

  const totalSpent = Array.from(current.values()).reduce((a, b) => a + b, 0);

  return [
    `Month: ${MONTH_NAMES[month - 1]} ${year}. Currency: ${currency}.`,
    `Income this month: ${money(income)}.`,
    `Total spent this month: ${money(totalSpent)}.`,
    `Savings this month (income minus spending): ${money(income - totalSpent)}.`,
    savingsTarget > 0
      ? `Savings target: ${money(savingsTarget)}.`
      : `No savings target has been set.`,
    "",
    "Categories:",
    ...rows,
    "",
    paymentRows.length > 0 ? "Payment methods used this month:" : "",
    ...paymentRows,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Asks Claude where this user could cut back next month, grounded in their
 * own aggregated figures. Returns a status rather than throwing so the UI
 * can explain a missing API key or thin data.
 */
export async function getOptimizationAdvice(
  month: number,
  year: number,
): Promise<AdviceResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { status: "not-configured" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "You must be logged in." };

  const historyMonths = Array.from({ length: HISTORY_MONTHS }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 2 - index, 1));
    return { month: date.getUTCMonth() + 1, year: date.getUTCFullYear() };
  });

  const [budget, current, income, history] = await Promise.all([
    getBudgetForMonth(month, year),
    monthTotals(supabase, user.id, month, year),
    totalIncome(supabase, user.id, month, year),
    Promise.all(
      historyMonths.map((point) =>
        monthTotals(supabase, user.id, point.month, point.year),
      ),
    ),
  ]);

  const populatedHistory = history.filter((entry) => entry.rowCount > 0);

  if (current.rowCount === 0 && populatedHistory.length === 0) {
    return {
      status: "no-data",
      message:
        "There are no expenses recorded for this month or the months before it, so there's no spending pattern to work from yet.",
    };
  }

  const facts = buildFacts({
    currency: budget?.currency ?? "USD",
    month,
    year,
    income,
    savingsTarget: budget?.savingsTarget ?? 0,
    categories: (budget?.categories ?? []).map((category) => ({
      category: category.category,
      allocatedAmount: category.allocatedAmount,
    })),
    current: current.byCategory,
    history: populatedHistory.map((entry) => entry.byCategory),
    payments: current.byPaymentMethod,
  });

  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      thinking: { type: "adaptive" },
      output_config: {
        format: zodOutputFormat(AdviceSchema),
      },
      messages: [
        {
          role: "user",
          content: `Here are my figures. Tell me where to optimise next month.\n\n${facts}`,
        },
      ],
    });

    const advice = response.parsed_output;
    if (!advice) {
      return {
        status: "error",
        message: "The model returned an unreadable response. Try again.",
      };
    }

    return { status: "ok", advice, generatedAt: new Date().toISOString() };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return {
        status: "error",
        message: "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY.",
      };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return {
        status: "error",
        message: "Rate limited by the Anthropic API. Try again in a moment.",
      };
    }
    if (error instanceof Anthropic.APIError) {
      return {
        status: "error",
        message: `Anthropic API error ${error.status}: ${error.message}`,
      };
    }
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Failed to generate advice.",
    };
  }
}
