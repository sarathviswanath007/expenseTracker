"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PageContainer } from "@/components/shell/page-container";
import {
  MonthYearPicker,
  PageToolbar,
} from "@/components/shell/month-year-picker";
import { MONTH_NAMES } from "@/lib/dates";
import { cn } from "@/lib/utils";

type ExportKind = "summary" | "budget" | "expenses";
type Format = "csv" | "xlsx";

const KINDS: { key: ExportKind; label: string; detail: string }[] = [
  {
    key: "summary",
    label: "Monthly summary",
    detail: "Income, spending, savings, and how much of the budget was used.",
  },
  {
    key: "budget",
    label: "Budget by category",
    detail: "What you planned per category against what you spent.",
  },
  {
    key: "expenses",
    label: "Expenses",
    detail: "Every expense in the month, with payment method and description.",
  },
];

const FORMATS: {
  key: Format;
  label: string;
  detail: string;
  icon: typeof FileText;
}[] = [
  {
    key: "xlsx",
    label: "Excel",
    detail: "One workbook, one sheet per section.",
    icon: FileSpreadsheet,
  },
  {
    key: "csv",
    label: "CSV",
    detail: "Plain text, opens anywhere.",
    icon: FileText,
  },
];

export function ExportView({ month, year }: { month: number; year: number }) {
  const router = useRouter();
  const [format, setFormat] = useState<Format>("xlsx");
  const [selected, setSelected] = useState<ExportKind[]>([
    "summary",
    "budget",
    "expenses",
  ]);

  function toggle(kind: ExportKind) {
    setSelected((prev) =>
      prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind],
    );
  }

  const href = `/api/export?month=${month}&year=${year}&format=${format}&kinds=${selected.join(",")}`;
  const period = `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <PageContainer width="narrow">
      <PageToolbar context={`Exporting ${period}`}>
        <MonthYearPicker
          month={month}
          year={year}
          onChange={(nextMonth, nextYear) =>
            router.push(`/export?month=${nextMonth}&year=${nextYear}`)
          }
        />
      </PageToolbar>

      <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3">
          <h2 className="font-medium">What to include</h2>
          <div className="flex flex-col gap-2">
            {KINDS.map((kind) => (
              <label
                key={kind.key}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  selected.includes(kind.key)
                    ? "border-primary/40 bg-primary/[0.04]"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <Checkbox
                  className="mt-0.5"
                  checked={selected.includes(kind.key)}
                  onCheckedChange={() => toggle(kind.key)}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{kind.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {kind.detail}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Format</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {FORMATS.map((option) => {
              const Icon = option.icon;
              const active = format === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFormat(option.key)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-primary/40 bg-primary/[0.04]"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      active ? "text-primary-accent" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {option.detail}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            {selected.length === 0
              ? "Choose at least one section."
              : `${selected.length} section${selected.length === 1 ? "" : "s"} · ${period}`}
          </p>
          <Button
            render={<a href={href} download />}
            nativeButton={false}
            disabled={selected.length === 0}
            aria-disabled={selected.length === 0}
          >
            <Download aria-hidden="true" />
            Download {format === "xlsx" ? "Excel" : "CSV"}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Amounts are exported as plain numbers so they stay sortable and summable
        in your spreadsheet. Text that a spreadsheet would read as a formula is
        escaped.
      </p>
    </PageContainer>
  );
}
