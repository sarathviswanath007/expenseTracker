import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { toWorkbook } from "@/lib/export-workbook";
import type { ExportSheet } from "@/lib/export-format";

const sheets: ExportSheet[] = [
  {
    name: "Summary",
    columns: ["Measure", "Amount (INR)"],
    rows: [
      ["Income", 295000],
      ["Expenses", 232066],
    ],
  },
  {
    name: "Expenses",
    columns: ["Date", "Category", "Amount (INR)", "Description"],
    rows: [["2026-08-27", "Rent", 25500, "August rent"]],
  },
];

async function reopen(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook();
  // ExcelJS reads from an ArrayBuffer; a Buffer view slice keeps it exact.
  await workbook.xlsx.load(
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer,
  );
  return workbook;
}

describe("toWorkbook", () => {
  it("writes a real xlsx container", async () => {
    const buffer = await toWorkbook(sheets);

    // xlsx is a zip; every zip starts with the PK local file header.
    expect(buffer.subarray(0, 2).toString("latin1")).toBe("PK");
    expect(buffer.byteLength).toBeGreaterThan(1000);
  });

  it("puts each section on its own named sheet", async () => {
    const workbook = await reopen(await toWorkbook(sheets));

    expect(workbook.worksheets.map((w) => w.name)).toEqual([
      "Summary",
      "Expenses",
    ]);
  });

  it("keeps amounts numeric so a spreadsheet can sum them", async () => {
    const workbook = await reopen(await toWorkbook(sheets));
    const summary = workbook.getWorksheet("Summary")!;

    expect(summary.getRow(2).getCell(2).value).toBe(295000);
    expect(typeof summary.getRow(2).getCell(2).value).toBe("number");
  });

  it("writes the header row first and freezes it", async () => {
    const workbook = await reopen(await toWorkbook(sheets));
    const expenses = workbook.getWorksheet("Expenses")!;

    expect(expenses.getRow(1).values).toEqual([
      undefined,
      "Date",
      "Category",
      "Amount (INR)",
      "Description",
    ]);
    expect(expenses.views[0]).toMatchObject({ state: "frozen", ySplit: 1 });
  });

  it("sanitises a sheet name Excel would reject", async () => {
    const workbook = await reopen(
      await toWorkbook([{ ...sheets[0], name: "Food/Drink [2026]" }]),
    );

    expect(workbook.worksheets[0].name).toBe("Food Drink  2026");
  });
});
