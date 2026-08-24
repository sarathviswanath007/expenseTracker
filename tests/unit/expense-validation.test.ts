import { describe, expect, it } from "vitest";
import {
  getExpenseAmountError,
  getExpenseCategoryError,
  getExpenseDateError,
  getExpenseFormErrors,
  getExpensePaymentMethodError,
} from "@/lib/expense-validation";

describe("getExpenseAmountError", () => {
  it("rejects an empty amount", () => {
    expect(getExpenseAmountError("")).not.toBeNull();
  });

  it("rejects zero and negative amounts", () => {
    expect(getExpenseAmountError("0")).not.toBeNull();
    expect(getExpenseAmountError("-5")).not.toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(getExpenseAmountError("abc")).not.toBeNull();
  });

  it("accepts a positive amount", () => {
    expect(getExpenseAmountError("12.50")).toBeNull();
  });
});

describe("getExpenseCategoryError", () => {
  it("requires a category", () => {
    expect(getExpenseCategoryError("")).not.toBeNull();
    expect(getExpenseCategoryError("Food")).toBeNull();
  });
});

describe("getExpenseDateError", () => {
  it("requires a date", () => {
    expect(getExpenseDateError("")).not.toBeNull();
  });

  it("rejects a malformed date", () => {
    expect(getExpenseDateError("24-08-2026")).not.toBeNull();
    expect(getExpenseDateError("not-a-date")).not.toBeNull();
  });

  it("accepts an ISO date", () => {
    expect(getExpenseDateError("2026-08-24")).toBeNull();
  });
});

describe("getExpensePaymentMethodError", () => {
  it("rejects an unknown payment method", () => {
    expect(getExpensePaymentMethodError("Bitcoin")).not.toBeNull();
  });

  it("accepts a known payment method", () => {
    expect(getExpensePaymentMethodError("UPI")).toBeNull();
  });
});

describe("getExpenseFormErrors", () => {
  it("returns no errors for a fully valid form", () => {
    const errors = getExpenseFormErrors({
      amount: "1250",
      category: "Food",
      date: "2026-08-24",
      paymentMethod: "UPI",
    });
    expect(errors).toEqual({});
  });

  it("collects one error per invalid field", () => {
    const errors = getExpenseFormErrors({
      amount: "",
      category: "",
      date: "",
      paymentMethod: "",
    });
    expect(Object.keys(errors).sort()).toEqual([
      "amount",
      "category",
      "date",
      "paymentMethod",
    ]);
  });
});
