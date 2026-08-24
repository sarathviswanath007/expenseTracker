export const CHART_SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
];

export const CHART_OTHER_COLOR = "var(--muted-foreground)";

export interface FoldedCategoryTotal {
  category: string;
  amount: number;
  color: string;
}

/**
 * Caps categorical series at the validated palette size, folding the rest
 * into a single "Other" bucket instead of generating additional hues (an
 * extra hue would be indistinguishable from an existing one under CVD).
 */
export function foldCategoriesForChart(
  totals: { category: string; amount: number }[],
): FoldedCategoryTotal[] {
  const sorted = [...totals].sort((a, b) => b.amount - a.amount);
  const head = sorted
    .slice(0, CHART_SERIES_COLORS.length)
    .map((t, i) => ({ ...t, color: CHART_SERIES_COLORS[i] }));
  const tail = sorted.slice(CHART_SERIES_COLORS.length);

  if (tail.length === 0) return head;

  const otherAmount = tail.reduce((sum, t) => sum + t.amount, 0);
  return [
    ...head,
    { category: "Other", amount: otherAmount, color: CHART_OTHER_COLOR },
  ];
}
