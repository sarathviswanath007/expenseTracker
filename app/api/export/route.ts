import { NextResponse, type NextRequest } from "next/server";
import { getMonthlyReport, type ExportKind } from "@/services/export.service";
import { exportFileStem, toCsv } from "@/lib/export-format";
import { toWorkbook } from "@/lib/export-workbook";
import { parseMonthYearParams } from "@/lib/dates";

const KINDS: ExportKind[] = ["summary", "budget", "expenses"];

function parseKinds(raw: string | null): ExportKind[] {
  const requested = (raw ?? "").split(",").filter(Boolean);
  const valid = KINDS.filter((kind) => requested.includes(kind));
  return valid.length > 0 ? valid : KINDS;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const { month, year } = parseMonthYearParams({
    month: params.get("month") ?? undefined,
    year: params.get("year") ?? undefined,
  });
  const format = params.get("format") === "xlsx" ? "xlsx" : "csv";
  const kinds = parseKinds(params.get("kinds"));

  const report = await getMonthlyReport(month, year, kinds);
  if (!report) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (format === "xlsx") {
    const body = await toWorkbook(report.sheets);
    const name = `${exportFileStem("report", month, year)}.xlsx`;
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // CSV holds one table, so several sheets are stacked with a blank line and
  // a title between them rather than silently dropping all but the first.
  const body = report.sheets
    .map((sheet) =>
      report.sheets.length > 1
        ? `${sheet.name}\r\n${toCsv(sheet)}`
        : toCsv(sheet),
    )
    .join("\r\n\r\n");

  const kind = kinds.length === 1 ? kinds[0] : "report";
  const name = `${exportFileStem(kind, month, year)}.csv`;

  return new NextResponse(`﻿${body}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
