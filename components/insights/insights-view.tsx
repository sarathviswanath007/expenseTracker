"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/shell/page-container";
import {
  MonthYearPicker,
  PageToolbar,
} from "@/components/shell/month-year-picker";
import { MONTH_NAMES } from "@/lib/dates";
import { InsightRow, TONE } from "@/components/insights/insight-row";
import { OptimizePanel } from "@/components/insights/optimize-panel";
import type { InsightTone } from "@/lib/insight-rules";
import type { InsightsResult } from "@/services/ai-insights.service";

const GROUP_ORDER: InsightTone[] = [
  "critical",
  "attention",
  "neutral",
  "positive",
];

export function InsightsView({
  month,
  year,
  result,
}: {
  month: number;
  year: number;
  result: InsightsResult | null;
}) {
  const router = useRouter();

  function changeMonthYear(nextMonth: number, nextYear: number) {
    router.push(`/insights?month=${nextMonth}&year=${nextYear}`);
  }

  if (!result) {
    return (
      <PageContainer>
        <p className="text-muted-foreground">Log in to view your insights.</p>
      </PageContainer>
    );
  }

  const { insights, hasBudget, hasExpenses, currency } = result;
  const grouped = GROUP_ORDER.map((tone) => ({
    tone,
    items: insights.filter((insight) => insight.tone === tone),
  })).filter((group) => group.items.length > 0);

  return (
    <PageContainer>
      <PageToolbar context={`Showing ${MONTH_NAMES[month - 1]} ${year}`}>
        <MonthYearPicker month={month} year={year} onChange={changeMonthYear} />
      </PageToolbar>

      <section className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-accent">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-medium">
            {insights.length > 0
              ? `${insights.length} insight${insights.length === 1 ? "" : "s"} for ${MONTH_NAMES[month - 1]}`
              : `Nothing to flag for ${MONTH_NAMES[month - 1]}`}
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">
            Worked out from your own budgets, expenses, and income — every
            number below comes from your data, compared against your last three
            months.
          </p>
        </div>
      </section>

      <OptimizePanel month={month} year={year} currency={currency} />

      {insights.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={
            !hasBudget
              ? "Set a budget to unlock insights"
              : !hasExpenses
                ? "No spending this month yet"
                : "Nothing stands out this month"
          }
          description={
            !hasBudget
              ? "Insights compare what you spend against what you planned, so they need a budget for this month first."
              : !hasExpenses
                ? "Log a few expenses and this page will start flagging overspending, category spikes, and budgets worth trimming."
                : "Your spending is inside its budgets and close to your usual pattern. Check back as the month fills in."
          }
          action={
            !hasBudget ? (
              <Button
                render={<Link href={`/budgets?month=${month}&year=${year}`} />}
                nativeButton={false}
              >
                Set up a budget
              </Button>
            ) : !hasExpenses ? (
              <Button render={<Link href="/expenses" />} nativeButton={false}>
                Log an expense
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map((group) => (
            <section key={group.tone} className="flex flex-col gap-2.5">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {TONE[group.tone].label}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {group.items.map((insight) => (
                  <InsightRow key={insight.id} insight={insight} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
