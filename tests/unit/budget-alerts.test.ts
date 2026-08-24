import { describe, expect, it } from "vitest";
import { getCategoryAlertStatus } from "@/lib/budget-alerts";

describe("getCategoryAlertStatus", () => {
  it("returns ok when spending is well under the threshold", () => {
    expect(getCategoryAlertStatus(500, 10000, 85)).toBe("ok");
  });

  it("returns warning at or above the threshold percentage", () => {
    expect(getCategoryAlertStatus(8500, 10000, 85)).toBe("warning");
    expect(getCategoryAlertStatus(9000, 10000, 85)).toBe("warning");
  });

  it("returns exceeded once spending passes the allocated amount", () => {
    expect(getCategoryAlertStatus(10001, 10000, 85)).toBe("exceeded");
  });

  it("treats a zero allocation with any spending as exceeded", () => {
    expect(getCategoryAlertStatus(1, 0, 85)).toBe("exceeded");
  });

  it("treats a zero allocation with no spending as ok", () => {
    expect(getCategoryAlertStatus(0, 0, 85)).toBe("ok");
  });
});
