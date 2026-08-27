import { describe, expect, it } from "vitest";
import { generateInsights, type InsightInput } from "@/lib/insight-rules";

function input(overrides: Partial<InsightInput> = {}): InsightInput {
  return {
    currency: "USD",
    month: 8,
    year: 2026,
    totalIncome: 0,
    totalExpenses: 0,
    savingsTarget: 0,
    budgetCategories: [],
    currentTotals: [],
    historyTotals: [],
    historyExpenseTotals: [],
    paymentTotals: [],
    ...overrides,
  };
}

function kinds(insights: ReturnType<typeof generateInsights>) {
  return insights.map((insight) => insight.kind);
}

describe("generateInsights", () => {
  it("returns nothing for an empty month", () => {
    expect(generateInsights(input())).toEqual([]);
  });

  it("flags a category that is over its budget", () => {
    const [insight] = generateInsights(
      input({
        budgetCategories: [
          { category: "Food", allocatedAmount: 400, alertThresholdPercent: 85 },
        ],
        currentTotals: [{ category: "Food", amount: 450 }],
        totalExpenses: 450,
      }),
    );

    expect(insight.kind).toBe("over-budget");
    expect(insight.tone).toBe("critical");
    expect(insight.detail).toContain("$50.00 past the limit");
  });

  it("separates a reached limit from an approaching one", () => {
    const reached = generateInsights(
      input({
        budgetCategories: [
          { category: "Rent", allocatedAmount: 400, alertThresholdPercent: 85 },
        ],
        currentTotals: [{ category: "Rent", amount: 400 }],
      }),
    );
    expect(kinds(reached)).toContain("limit-reached");

    const approaching = generateInsights(
      input({
        budgetCategories: [
          { category: "Rent", allocatedAmount: 400, alertThresholdPercent: 85 },
        ],
        currentTotals: [{ category: "Rent", amount: 350 }],
      }),
    );
    expect(kinds(approaching)).toContain("approaching-limit");
  });

  it("reports a spike against the recent average", () => {
    const insights = generateInsights(
      input({
        currentTotals: [{ category: "Food", amount: 270 }],
        historyTotals: [
          [{ category: "Food", amount: 200 }],
          [{ category: "Food", amount: 200 }],
        ],
      }),
    );

    const spike = insights.find((i) => i.kind === "spending-spike");
    expect(spike?.detail).toContain("35% higher");
    expect(spike?.detail).toContain("2-month average");
  });

  it("credits a drop in spending", () => {
    const insights = generateInsights(
      input({
        currentTotals: [{ category: "Shopping", amount: 100 }],
        historyTotals: [[{ category: "Shopping", amount: 200 }]],
      }),
    );

    expect(kinds(insights)).toContain("spending-drop");
  });

  it("ignores movement below the reporting threshold", () => {
    const insights = generateInsights(
      input({
        currentTotals: [{ category: "Food", amount: 210 }],
        historyTotals: [[{ category: "Food", amount: 200 }]],
      }),
    );

    expect(kinds(insights)).not.toContain("spending-spike");
  });

  it("suggests trimming a budget that goes mostly unused", () => {
    const insights = generateInsights(
      input({
        budgetCategories: [
          {
            category: "Entertainment",
            allocatedAmount: 5000,
            alertThresholdPercent: 85,
          },
        ],
        currentTotals: [],
        historyTotals: [
          [{ category: "Entertainment", amount: 1200 }],
          [{ category: "Entertainment", amount: 1400 }],
        ],
      }),
    );

    const unused = insights.find((i) => i.kind === "unused-budget");
    expect(unused?.detail).toContain("reducing it to $1,500.00");
  });

  it("measures savings against the target", () => {
    const short = generateInsights(
      input({ totalIncome: 5000, totalExpenses: 4500, savingsTarget: 1000 }),
    );
    expect(kinds(short)).toContain("savings-shortfall");

    const met = generateInsights(
      input({ totalIncome: 5000, totalExpenses: 3500, savingsTarget: 1000 }),
    );
    expect(kinds(met)).toContain("savings-on-track");
  });

  it("estimates what could be saved when no target is set", () => {
    const insights = generateInsights(
      input({
        totalIncome: 5000,
        historyExpenseTotals: [3000, 3400],
      }),
    );

    const potential = insights.find((i) => i.kind === "potential-savings");
    expect(potential?.detail).toContain("$1,800.00 a month");
  });

  it("only calls out a payment method with enough purchases", () => {
    const few = generateInsights(
      input({
        paymentTotals: [
          { paymentMethod: "Credit Card", count: 4, amount: 900 },
        ],
      }),
    );
    expect(kinds(few)).not.toContain("payment-pattern");

    const many = generateInsights(
      input({
        paymentTotals: [
          { paymentMethod: "Credit Card", count: 8, amount: 9200 },
        ],
      }),
    );
    expect(kinds(many)).toContain("payment-pattern");
  });

  it("sorts the most urgent insight first", () => {
    const insights = generateInsights(
      input({
        budgetCategories: [
          { category: "Food", allocatedAmount: 400, alertThresholdPercent: 85 },
        ],
        currentTotals: [{ category: "Food", amount: 450 }],
        totalIncome: 5000,
        totalExpenses: 450,
        savingsTarget: 1000,
        paymentTotals: [{ paymentMethod: "Cash", count: 6, amount: 450 }],
      }),
    );

    expect(insights[0].kind).toBe("over-budget");
    expect(insights.at(-1)?.kind).toBe("payment-pattern");
  });
});
