import { describe, expect, it } from "vitest";
import {
  describeMonths,
  goalProgress,
  monthlySavingsRate,
} from "@/lib/goal-math";

const TODAY = new Date("2026-08-27T00:00:00.000Z");

describe("goalProgress", () => {
  it("reports progress and what is left", () => {
    const result = goalProgress(
      { targetAmount: 100000, currentAmount: 25000 },
      10000,
      TODAY,
    );

    expect(result.percent).toBe(25);
    expect(result.remaining).toBe(75000);
    expect(result.monthsToTarget).toBe(8);
  });

  it("projects the completion date from the savings rate", () => {
    const result = goalProgress(
      { targetAmount: 100000, currentAmount: 25000 },
      10000,
      TODAY,
    );

    expect(result.projectedDate).toBe("2027-04-27");
  });

  it("rounds a part month up, because a goal isn't met early", () => {
    const result = goalProgress(
      { targetAmount: 1000, currentAmount: 0 },
      300,
      TODAY,
    );

    expect(result.monthsToTarget).toBe(4);
  });

  it("treats a funded goal as complete", () => {
    const result = goalProgress(
      { targetAmount: 5000, currentAmount: 6000 },
      1000,
      TODAY,
    );

    expect(result.percent).toBe(100);
    expect(result.remaining).toBe(0);
    expect(result.monthsToTarget).toBe(0);
  });

  it("refuses to project when nothing is being saved", () => {
    const result = goalProgress(
      { targetAmount: 100000, currentAmount: 0 },
      0,
      TODAY,
    );

    expect(result.monthsToTarget).toBeNull();
    expect(result.projectedDate).toBeNull();
  });

  it("refuses to project absurdly far out", () => {
    const result = goalProgress(
      { targetAmount: 10_000_000, currentAmount: 0 },
      1,
      TODAY,
    );

    expect(result.monthsToTarget).toBeNull();
    expect(result.pace).toBe("no-target-date");
  });

  it("compares the projection against a target date", () => {
    const ahead = goalProgress(
      { targetAmount: 10000, currentAmount: 0, targetDate: "2027-12-31" },
      1000,
      TODAY,
    );
    expect(ahead.pace).toBe("ahead");

    const behind = goalProgress(
      { targetAmount: 10000, currentAmount: 0, targetDate: "2026-10-01" },
      1000,
      TODAY,
    );
    expect(behind.pace).toBe("behind");
  });

  it("says so when there is no target date to judge against", () => {
    const result = goalProgress(
      { targetAmount: 10000, currentAmount: 0 },
      1000,
      TODAY,
    );

    expect(result.pace).toBe("no-target-date");
  });
});

describe("monthlySavingsRate", () => {
  it("averages the months that had savings", () => {
    expect(monthlySavingsRate([10000, 20000, 30000])).toBe(20000);
  });

  it("ignores months that ran a deficit", () => {
    expect(monthlySavingsRate([10000, -5000, 20000])).toBe(15000);
  });

  it("is zero when nothing was ever saved", () => {
    expect(monthlySavingsRate([-100, 0])).toBe(0);
    expect(monthlySavingsRate([])).toBe(0);
  });
});

describe("describeMonths", () => {
  it("reads the way a person would say it", () => {
    expect(describeMonths(1)).toBe("1 month");
    expect(describeMonths(8)).toBe("8 months");
    expect(describeMonths(12)).toBe("1 year");
    expect(describeMonths(14)).toBe("1 year 2 months");
    expect(describeMonths(25)).toBe("2 years 1 month");
  });
});
