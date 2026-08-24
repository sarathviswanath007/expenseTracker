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

export function findTopCategory(
  categoryTotals: CategoryTotal[],
): CategoryTotal | null {
  if (categoryTotals.length === 0) return null;
  return categoryTotals.reduce((top, current) =>
    current.amount > top.amount ? current : top,
  );
}
