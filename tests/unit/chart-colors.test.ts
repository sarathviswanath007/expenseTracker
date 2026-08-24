import { describe, expect, it } from "vitest";
import {
  CHART_OTHER_COLOR,
  CHART_SERIES_COLORS,
  foldCategoriesForChart,
} from "@/lib/chart-colors";

describe("foldCategoriesForChart", () => {
  it("assigns a distinct color to each category when under the cap", () => {
    const result = foldCategoriesForChart([
      { category: "Food", amount: 200 },
      { category: "Rent", amount: 1000 },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      category: "Rent",
      amount: 1000,
      color: CHART_SERIES_COLORS[0],
    });
    expect(result[1]).toEqual({
      category: "Food",
      amount: 200,
      color: CHART_SERIES_COLORS[1],
    });
  });

  it("folds categories past the palette cap into Other", () => {
    const totals = Array.from({ length: 9 }, (_, i) => ({
      category: `Category ${i}`,
      amount: 9 - i,
    }));
    const result = foldCategoriesForChart(totals);

    expect(result).toHaveLength(CHART_SERIES_COLORS.length + 1);
    expect(result.at(-1)).toEqual({
      category: "Other",
      amount: 3,
      color: CHART_OTHER_COLOR,
    });
  });

  it("sums the folded amounts correctly", () => {
    const totals = [
      { category: "A", amount: 10 },
      { category: "B", amount: 9 },
      { category: "C", amount: 8 },
      { category: "D", amount: 7 },
      { category: "E", amount: 6 },
      { category: "F", amount: 5 },
      { category: "G", amount: 4 },
      { category: "H", amount: 3 },
      { category: "I", amount: 2 },
    ];
    const result = foldCategoriesForChart(totals);
    const other = result.find((r) => r.category === "Other");
    expect(other?.amount).toBe(3 + 2);
  });
});
