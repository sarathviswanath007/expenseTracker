import ExcelJS from "exceljs";
import { safeSheetName, type ExportSheet } from "@/lib/export-format";

/**
 * Builds a real .xlsx: one sheet per section, bold frozen header, and columns
 * sized to their widest cell so numbers don't open as ####. Amounts stay
 * numeric so the spreadsheet can sum them.
 */
export async function toWorkbook(sheets: ExportSheet[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "BudgetWise AI";
  workbook.created = new Date();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(safeSheetName(sheet.name));
    worksheet.addRow(sheet.columns);
    worksheet.getRow(1).font = { bold: true };
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    for (const row of sheet.rows) {
      worksheet.addRow(row);
    }

    worksheet.columns.forEach((column, index) => {
      const widest = [
        sheet.columns[index] ?? "",
        ...sheet.rows.map((row) => row[index]),
      ]
        .map((value) => String(value ?? "").length)
        .reduce((max, length) => Math.max(max, length), 10);
      column.width = Math.min(widest + 2, 48);
    });
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
