import { describe, expect, it } from "vitest";
import {
  exportFileStem,
  safeSheetName,
  toCsv,
  type ExportSheet,
} from "@/lib/export-format";

function sheet(rows: ExportSheet["rows"]): ExportSheet {
  return { name: "Expenses", columns: ["Date", "Category", "Amount"], rows };
}

describe("toCsv", () => {
  it("writes a header row and CRLF line endings", () => {
    const csv = toCsv(sheet([["2026-08-27", "Food", 1200]]));

    expect(csv).toBe("Date,Category,Amount\r\n2026-08-27,Food,1200");
  });

  it("quotes values containing a comma, quote, or newline", () => {
    const csv = toCsv(
      sheet([
        ["2026-08-27", "Dinner, with friends", 1200],
        ["2026-08-27", 'He said "hi"', 30],
        ["2026-08-27", "line one\nline two", 40],
      ]),
    );

    expect(csv).toContain('"Dinner, with friends"');
    expect(csv).toContain('"He said ""hi"""');
    expect(csv).toContain('"line one\nline two"');
  });

  it("neutralises a value that would be read as a formula", () => {
    const csv = toCsv(sheet([["2026-08-27", "=1+1", 10]]));

    expect(csv).toContain("'=1+1");
  });

  it("leaves a negative number usable as a number", () => {
    const csv = toCsv(sheet([["2026-08-27", "Refund", -500]]));

    expect(csv).toContain(",-500");
  });

  it("renders empty cells for null and undefined", () => {
    const csv = toCsv(sheet([["2026-08-27", null, undefined]]));

    expect(csv).toBe("Date,Category,Amount\r\n2026-08-27,,");
  });
});

describe("exportFileStem", () => {
  it("pads the month so files sort chronologically", () => {
    expect(exportFileStem("expenses", 8, 2026)).toBe(
      "budgetwise-expenses-2026-08",
    );
    expect(exportFileStem("summary", 12, 2026)).toBe(
      "budgetwise-summary-2026-12",
    );
  });
});

describe("safeSheetName", () => {
  it("strips characters Excel rejects", () => {
    expect(safeSheetName("Food/Drink [2026]")).toBe("Food Drink  2026");
  });

  it("truncates to Excel's 31-character limit", () => {
    expect(safeSheetName("a".repeat(40))).toHaveLength(31);
  });

  it("falls back when nothing usable is left", () => {
    expect(safeSheetName("///")).toBe("Sheet");
  });
});
