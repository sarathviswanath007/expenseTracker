import { formatCurrency } from "@/lib/format-currency";
import type { CategoryTotal } from "@/lib/dashboard-math";
import type { Currency } from "@/types/budget";

export type InsightKind =
  | "over-budget"
  | "limit-reached"
  | "approaching-limit"
  | "spending-spike"
  | "spending-drop"
  | "unused-budget"
  | "savings-shortfall"
  | "savings-on-track"
  | "potential-savings"
  | "payment-pattern";

/** Maps to the app's colour roles: critical (red), attention (indigo),
 *  positive (green), neutral (muted). */
export type InsightTone = "critical" | "attention" | "positive" | "neutral";

export interface InsightAction {
  label: string;
  href: string;
}

export interface Insight {
  id: string;
  kind: InsightKind;
  tone: InsightTone;
  title: string;
  detail: string;
  action?: InsightAction;
  /** Lower sorts first. */
  priority: number;
}

export interface InsightBudgetCategory {
  category: string;
  allocatedAmount: number;
  alertThresholdPercent: number;
}

export interface PaymentMethodTotal {
  paymentMethod: string;
  count: number;
  amount: number;
}

export interface InsightInput {
  currency: Currency;
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  savingsTarget: number;
  budgetCategories: InsightBudgetCategory[];
  /** Category totals for the month being viewed. */
  currentTotals: CategoryTotal[];
  /** Category totals for each earlier month, most recent first. */
  historyTotals: CategoryTotal[][];
  /** Total expenses for each earlier month, most recent first. */
  historyExpenseTotals: number[];
  paymentTotals: PaymentMethodTotal[];
}

/** A category's spend has to move at least this much to be worth reporting. */
const SPIKE_PERCENT = 30;
/** Below this share of its allocation, a budget looks oversized. */
const UNUSED_SHARE = 0.4;
/** Fewer purchases than this on one payment method isn't a pattern. */
const MIN_PATTERN_COUNT = 5;

function totalFor(totals: CategoryTotal[], category: string): number {
  return totals.find((entry) => entry.category === category)?.amount ?? 0;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Rounds a suggested budget up to the nearest 500 so the advice reads like
 *  a decision a person would make, not a raw average. */
function roundedSuggestion(value: number): number {
  return Math.ceil(value / 500) * 500;
}

function expenseHref(category: string): string {
  return `/expenses?category=${encodeURIComponent(category)}`;
}

/**
 * Turns a month of budget and spending data into plain-language insights.
 * Every claim carries the numbers it came from — these are computed rules,
 * not model-generated advice.
 */
export function generateInsights(input: InsightInput): Insight[] {
  const {
    currency,
    month,
    year,
    totalIncome,
    totalExpenses,
    savingsTarget,
    budgetCategories,
    currentTotals,
    historyTotals,
    historyExpenseTotals,
    paymentTotals,
  } = input;

  const insights: Insight[] = [];
  const money = (value: number) => formatCurrency(value, currency);
  const budgetHref = `/budgets?month=${month}&year=${year}`;

  // --- Budget adherence, per category -----------------------------------
  for (const budgetCategory of budgetCategories) {
    const { category, allocatedAmount, alertThresholdPercent } = budgetCategory;
    if (allocatedAmount <= 0) continue;

    const spent = totalFor(currentTotals, category);
    const usedPercent = (spent / allocatedAmount) * 100;

    if (spent > allocatedAmount) {
      insights.push({
        id: `over-budget-${category}`,
        kind: "over-budget",
        tone: "critical",
        title: `${category} is over budget`,
        detail: `You've spent ${money(spent)} against a ${money(allocatedAmount)} budget — ${money(spent - allocatedAmount)} past the limit.`,
        action: { label: "See expenses", href: expenseHref(category) },
        priority: 0,
      });
    } else if (spent === allocatedAmount) {
      insights.push({
        id: `limit-reached-${category}`,
        kind: "limit-reached",
        tone: "attention",
        title: `${category} has reached its limit`,
        detail: `All ${money(allocatedAmount)} of the ${category} budget is spent. Anything more this month goes over.`,
        action: { label: "Adjust budget", href: budgetHref },
        priority: 1,
      });
    } else if (usedPercent >= alertThresholdPercent) {
      insights.push({
        id: `approaching-limit-${category}`,
        kind: "approaching-limit",
        tone: "attention",
        title: `${category} is close to its limit`,
        detail: `${money(spent)} of ${money(allocatedAmount)} is used — ${Math.round(usedPercent)}% of the budget, with ${money(allocatedAmount - spent)} left.`,
        action: { label: "See expenses", href: expenseHref(category) },
        priority: 2,
      });
    }
  }

  // --- Month-over-month movement, against the recent average -------------
  const historyMonths = historyTotals.length;
  if (historyMonths > 0) {
    const categories = new Set([
      ...currentTotals.map((entry) => entry.category),
      ...historyTotals.flatMap((totals) =>
        totals.map((entry) => entry.category),
      ),
    ]);

    for (const category of categories) {
      const spent = totalFor(currentTotals, category);
      const past = historyTotals.map((totals) => totalFor(totals, category));
      const priorAverage = average(past);
      if (priorAverage <= 0) continue;

      const changePercent = ((spent - priorAverage) / priorAverage) * 100;

      if (changePercent >= SPIKE_PERCENT) {
        insights.push({
          id: `spending-spike-${category}`,
          kind: "spending-spike",
          tone: "attention",
          title: `${category} spending is up`,
          detail: `${money(spent)} this month is ${Math.round(changePercent)}% higher than your ${historyMonths}-month average of ${money(priorAverage)}.`,
          action: { label: "See expenses", href: expenseHref(category) },
          priority: 3,
        });
      } else if (changePercent <= -SPIKE_PERCENT) {
        insights.push({
          id: `spending-drop-${category}`,
          kind: "spending-drop",
          tone: "positive",
          title: `${category} spending is down`,
          detail: `${money(spent)} this month is ${Math.abs(Math.round(changePercent))}% below your ${historyMonths}-month average of ${money(priorAverage)}.`,
          priority: 6,
        });
      }
    }

    // --- Budgets that look oversized -------------------------------------
    for (const { category, allocatedAmount } of budgetCategories) {
      if (allocatedAmount <= 0) continue;

      const past = historyTotals.map((totals) => totalFor(totals, category));
      const priorAverage = average(past);
      if (priorAverage <= 0) continue;
      if (priorAverage >= allocatedAmount * UNUSED_SHARE) continue;

      const suggestion = roundedSuggestion(priorAverage);
      if (suggestion >= allocatedAmount) continue;

      insights.push({
        id: `unused-budget-${category}`,
        kind: "unused-budget",
        tone: "neutral",
        title: `${category} budget looks oversized`,
        detail: `You've averaged ${money(priorAverage)} of a ${money(allocatedAmount)} budget. Consider reducing it to ${money(suggestion)} and moving the difference to savings.`,
        action: { label: "Adjust budget", href: budgetHref },
        priority: 7,
      });
    }
  }

  // --- Savings ----------------------------------------------------------
  const savings = totalIncome - totalExpenses;
  if (savingsTarget > 0) {
    if (savings < savingsTarget) {
      insights.push({
        id: "savings-shortfall",
        kind: "savings-shortfall",
        tone: "attention",
        title: "You're behind your savings target",
        detail: `You've saved ${money(savings)} of your ${money(savingsTarget)} target — ${money(savingsTarget - savings)} short with income of ${money(totalIncome)} against ${money(totalExpenses)} spent.`,
        action: { label: "Adjust budget", href: budgetHref },
        priority: 4,
      });
    } else {
      insights.push({
        id: "savings-on-track",
        kind: "savings-on-track",
        tone: "positive",
        title: "Savings target met",
        detail: `You've saved ${money(savings)} against a ${money(savingsTarget)} target.`,
        priority: 5,
      });
    }
  } else if (totalIncome > 0 && historyExpenseTotals.length > 0) {
    const averageSpend = average(historyExpenseTotals);
    const potential = totalIncome - averageSpend;
    if (potential > 0) {
      insights.push({
        id: "potential-savings",
        kind: "potential-savings",
        tone: "neutral",
        title: "You could set a savings target",
        detail: `Income of ${money(totalIncome)} against an average spend of ${money(averageSpend)} leaves about ${money(potential)} a month to save.`,
        action: { label: "Set a target", href: budgetHref },
        priority: 8,
      });
    }
  }

  // --- Payment habits ----------------------------------------------------
  const topPayment = [...paymentTotals]
    .filter((entry) => entry.count >= MIN_PATTERN_COUNT)
    .sort((a, b) => b.amount - a.amount)[0];
  if (topPayment) {
    insights.push({
      id: `payment-pattern-${topPayment.paymentMethod}`,
      kind: "payment-pattern",
      tone: "neutral",
      title: `${topPayment.paymentMethod} is your most-used method`,
      detail: `${topPayment.count} ${topPayment.paymentMethod.toLowerCase()} purchases this month, totalling ${money(topPayment.amount)}.`,
      priority: 9,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
