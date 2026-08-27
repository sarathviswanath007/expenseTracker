"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InsightRow } from "@/components/insights/insight-row";
import type { Insight } from "@/lib/insight-rules";

/**
 * The top few insights, on the dashboard. Same engine and wording as the
 * Insights page — this is just the short version.
 */
export function InsightsCard({
  insights,
  totalCount,
}: {
  insights: Insight[];
  totalCount: number;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-medium">What changed this month</h2>
            <p className="text-xs text-muted-foreground">
              Calculated from your budgets and spending.
            </p>
          </div>
        </div>
        {totalCount > insights.length && (
          <Button
            render={<Link href="/insights" />}
            nativeButton={false}
            variant="ghost"
            size="xs"
          >
            View all {totalCount}
          </Button>
        )}
      </div>

      {insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing notable yet. Once you have a couple of months of expenses,
          category changes and budget warnings will show up here.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {insights.map((insight) => (
            <InsightRow key={insight.id} insight={insight} />
          ))}
        </ul>
      )}
    </section>
  );
}
