import { describe, expect, it } from "vitest";
import {
  calculatePercentChange,
  calculateRemainingBudget,
  calculateSavings,
  calculateUtilizationPercent,
  findTopCategory,
} from "@/lib/dashboard-math";

describe("calculateRemainingBudget", () => {
  it("subtracts expenses from the total budget", () => {
    expect(calculateRemainingBudget(1000, 400)).toBe(600);
  });

  it("goes negative when overspent", () => {
    expect(calculateRemainingBudget(1000, 1500)).toBe(-500);
  });
});

describe("calculateUtilizationPercent", () => {
  it("computes the percentage spent", () => {
    expect(calculateUtilizationPercent(250, 1000)).toBe(25);
  });

  it("can exceed 100% when overspent", () => {
    expect(calculateUtilizationPercent(1500, 1000)).toBe(150);
  });

  it("returns 0 when there is no budget to divide by", () => {
    expect(calculateUtilizationPercent(100, 0)).toBe(0);
  });
});

describe("calculateSavings", () => {
  it("subtracts expenses from income", () => {
    expect(calculateSavings(5000, 3000)).toBe(2000);
  });

  it("can go negative when spending exceeds income", () => {
    expect(calculateSavings(1000, 1200)).toBe(-200);
  });
});

describe("calculatePercentChange", () => {
  it("computes an increase", () => {
    expect(calculatePercentChange(110, 100)).toBeCloseTo(10);
  });

  it("computes a decrease as negative", () => {
    expect(calculatePercentChange(80, 100)).toBeCloseTo(-20);
  });

  it("returns null when the previous value is zero", () => {
    expect(calculatePercentChange(500, 0)).toBeNull();
  });

  it("handles a negative previous value without flipping the sign", () => {
    expect(calculatePercentChange(-500, -1000)).toBeCloseTo(50);
  });
});

describe("findTopCategory", () => {
  it("returns null for an empty list", () => {
    expect(findTopCategory([])).toBeNull();
  });

  it("returns the category with the highest amount", () => {
    const result = findTopCategory([
      { category: "Food", amount: 200 },
      { category: "Rent", amount: 1000 },
      { category: "Shopping", amount: 500 },
    ]);
    expect(result).toEqual({ category: "Rent", amount: 1000 });
  });
});
