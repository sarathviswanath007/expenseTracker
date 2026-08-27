export type CellValue = string | number | null | undefined;

export interface ExportSheet {
  /** Sheet name in a workbook, and the file name stem for a single CSV. */
  name: string;
  columns: string[];
  rows: CellValue[][];
}

/**
 * Spreadsheet apps treat a leading =, +, -, @, tab, or CR in a cell as the
 * start of a formula, so user-entered text like "=cmd|..." would execute on
 * open. Prefixing with an apostrophe keeps it literal text.
 */
function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function toCell(value: CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }
  return neutralizeFormula(value);
}

function quote(value: string): string {
  // Quote when the value contains a delimiter, a quote, or a line break;
  // inner quotes double per RFC 4180.
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** RFC 4180 CSV, CRLF line endings, header row first. */
export function toCsv(sheet: ExportSheet): string {
  const lines = [
    sheet.columns.map((c) => quote(neutralizeFormula(c))).join(","),
    ...sheet.rows.map((row) => row.map((cell) => quote(toCell(cell))).join(",")),
  ];
  return lines.join("\r\n");
}

/** A filename stem like `budgetwise-expenses-2026-08`. */
export function exportFileStem(
  kind: string,
  month: number,
  year: number,
): string {
  return `budgetwise-${kind}-${year}-${String(month).padStart(2, "0")}`;
}

/**
 * Excel refuses sheet names over 31 characters or containing : \ / ? * [ ].
 * Names come from our own labels today, but a category could reach one.
 */
export function safeSheetName(name: string): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, " ").trim();
  return (cleaned || "Sheet").slice(0, 31);
}
