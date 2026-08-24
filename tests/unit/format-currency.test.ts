import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/format-currency";

describe("formatCurrency", () => {
  it("formats INR with the rupee symbol", () => {
    expect(formatCurrency(1234.5, "INR")).toBe("₹1,234.50");
  });

  it("formats GBP with the pound symbol", () => {
    expect(formatCurrency(1234.5, "GBP")).toBe("£1,234.50");
  });

  it("formats USD with the dollar symbol", () => {
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
  });

  it("rounds to two decimal places", () => {
    expect(formatCurrency(10, "USD")).toBe("$10.00");
  });
});
