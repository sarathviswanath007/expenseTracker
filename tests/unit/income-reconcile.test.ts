import { describe, expect, it } from "vitest";
import {
  reconcileIncome,
  type ExistingIncomeRow,
  type IncomingIncomeRow,
} from "@/lib/income-reconcile";

const salary: IncomingIncomeRow = {
  source: "Salary",
  amount: 295000,
  isRecurring: true,
};

describe("reconcileIncome", () => {
  it("inserts everything on a first run", () => {
    const { updates, inserts } = reconcileIncome([], [salary]);

    expect(updates).toEqual([]);
    expect(inserts).toEqual([salary]);
  });

  it("restates an existing source instead of adding a second copy", () => {
    const existing: ExistingIncomeRow[] = [{ id: "a", source: "Salary" }];

    const { updates, inserts } = reconcileIncome(existing, [
      { ...salary, amount: 310000 },
    ]);

    expect(inserts).toEqual([]);
    expect(updates).toEqual([
      { id: "a", source: "Salary", amount: 310000, isRecurring: true },
    ]);
  });

  it("matches regardless of case and surrounding space", () => {
    const existing: ExistingIncomeRow[] = [{ id: "a", source: "Salary" }];

    const { updates, inserts } = reconcileIncome(existing, [
      { ...salary, source: "  salary " },
    ]);

    expect(inserts).toEqual([]);
    expect(updates[0].id).toBe("a");
  });

  it("leaves income it doesn't mention alone", () => {
    const existing: ExistingIncomeRow[] = [
      { id: "a", source: "Salary" },
      { id: "b", source: "Freelance" },
    ];

    const { updates, inserts } = reconcileIncome(existing, [salary]);

    expect(inserts).toEqual([]);
    expect(updates.map((u) => u.id)).toEqual(["a"]);
  });

  it("claims each existing row once, leaving earlier duplicates untouched", () => {
    const existing: ExistingIncomeRow[] = [
      { id: "a", source: "Salary" },
      { id: "b", source: "Salary" },
    ];

    const { updates, inserts } = reconcileIncome(existing, [salary]);

    expect(updates.map((u) => u.id)).toEqual(["a"]);
    expect(inserts).toEqual([]);
  });

  it("collapses a source the user entered twice in one submission", () => {
    const { updates, inserts } = reconcileIncome(
      [],
      [salary, { ...salary, amount: 300000 }],
    );

    expect(updates).toEqual([]);
    expect(inserts).toEqual([{ ...salary, amount: 300000 }]);
  });

  it("ignores rows with a blank source", () => {
    const { updates, inserts } = reconcileIncome(
      [],
      [{ source: "   ", amount: 100, isRecurring: false }],
    );

    expect(updates).toEqual([]);
    expect(inserts).toEqual([]);
  });

  it("adds a genuinely new source alongside an updated one", () => {
    const existing: ExistingIncomeRow[] = [{ id: "a", source: "Salary" }];

    const { updates, inserts } = reconcileIncome(existing, [
      salary,
      { source: "Rental income", amount: 15000, isRecurring: true },
    ]);

    expect(updates.map((u) => u.id)).toEqual(["a"]);
    expect(inserts).toEqual([
      { source: "Rental income", amount: 15000, isRecurring: true },
    ]);
  });
});
