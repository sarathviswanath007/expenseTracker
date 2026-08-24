import { describe, expect, it } from "vitest";
import { formatAxisCurrency, formatCurrency } from "@/lib/format-currency";

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

describe("formatAxisCurrency", () => {
  it("drops cents for clean axis ticks", () => {
    expect(formatAxisCurrency(6500, "INR")).toBe("₹6,500");
    expect(formatAxisCurrency(0, "USD")).toBe("$0");
  });

  it("still rounds a fractional amount to the nearest whole unit", () => {
    expect(formatAxisCurrency(1234.5, "USD")).toBe("$1,235");
  });
});
