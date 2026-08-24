export interface CategoryTotal {
  category: string;
  amount: number;
}

export function calculateRemainingBudget(
  totalBudget: number,
  totalExpenses: number,
): number {
  return totalBudget - totalExpenses;
}

export function calculateUtilizationPercent(
  totalExpenses: number,
  totalBudget: number,
): number {
  if (totalBudget <= 0) return 0;
  return (totalExpenses / totalBudget) * 100;
}

export function calculateSavings(
  totalIncome: number,
  totalExpenses: number,
): number {
  return totalIncome - totalExpenses;
}

/**
 * Percent change from `previous` to `current`, or null when the previous
 * value is 0 — "up from nothing" has no meaningful percentage, and showing
 * 0% or ∞ would both misstate it.
 */
export function calculatePercentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function findTopCategory(
  categoryTotals: CategoryTotal[],
): CategoryTotal | null {
  if (categoryTotals.length === 0) return null;
  return categoryTotals.reduce((top, current) =>
    current.amount > top.amount ? current : top,
  );
}
