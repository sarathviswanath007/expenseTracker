"use client";

import { useState } from "react";
import { Sparkles, TrendingDown, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { MONTH_NAMES } from "@/lib/dates";
import {
  getOptimizationAdvice,
  type AdviceResult,
} from "@/services/ai-advice.service";
import type { Currency } from "@/types/budget";

const DIFFICULTY = {
  easy: "bg-positive-surface text-positive",
  moderate: "bg-primary/10 text-primary-accent",
  hard: "bg-warning-surface text-warning",
} as const;

/**
 * Claude's take on where to cut next month. Generated on demand rather than
 * on page load — each run is a billed API call.
 */
export function OptimizePanel({
  month,
  year,
  currency,
}: {
  month: number;
  year: number;
  currency: Currency;
}) {
  const [result, setResult] = useState<AdviceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const nextMonth = MONTH_NAMES[month % 12];

  async function handleGenerate() {
    setLoading(true);
    try {
      setResult(await getOptimizationAdvice(month, year));
    } catch (error) {
      setResult({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to generate advice.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-accent">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-medium">Where to optimise in {nextMonth}</h2>
            <p className="text-sm text-pretty text-muted-foreground">
              Claude reads the figures above — your budgets, what you actually
              spent, and your last three months — and suggests where the
              headroom is.
            </p>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Analysing..." : result ? "Regenerate" : "Get suggestions"}
        </Button>
      </div>

      {result?.status === "not-configured" && (
        <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
          No Anthropic API key configured. Add{" "}
          <code className="rounded bg-background px-1 py-0.5 text-xs">
            ANTHROPIC_API_KEY
          </code>{" "}
          to <code className="text-xs">.env.local</code> and restart the dev
          server. Everything else on this page works without it.
        </p>
      )}

      {result?.status === "no-data" && (
        <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
          {result.message}
        </p>
      )}

      {result?.status === "error" && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-critical-surface px-3 py-2.5 text-sm text-critical"
        >
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          {result.message}
        </p>
      )}

      {result?.status === "ok" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-pretty">{result.advice.summary}</p>

          {result.advice.recommendations.length > 0 && (
            <>
              <ul className="flex flex-col gap-2.5">
                {result.advice.recommendations.map((item) => (
                  <li
                    key={`${item.category}-${item.headline}`}
                    className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{item.headline}</p>
                      <span className="flex items-center gap-2">
                        {item.suggestedMonthlyChange > 0 && (
                          <span className="text-sm font-medium tabular-nums text-positive">
                            −
                            {formatCurrency(
                              item.suggestedMonthlyChange,
                              currency,
                            )}
                            /mo
                          </span>
                        )}
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                            DIFFICULTY[item.difficulty],
                          )}
                        >
                          {item.difficulty}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-pretty text-muted-foreground">
                      {item.rationale}
                    </p>
                  </li>
                ))}
              </ul>

              {result.advice.projectedMonthlySaving > 0 && (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-positive-surface px-3.5 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-positive">
                    <TrendingDown className="size-4" aria-hidden="true" />
                    If you make every change
                  </span>
                  <span className="font-semibold tabular-nums text-positive">
                    {formatCurrency(
                      result.advice.projectedMonthlySaving,
                      currency,
                    )}
                    /month
                  </span>
                </div>
              )}
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Generated by Claude from your own figures. Suggestions, not
            financial advice — check them against what you know about the month
            ahead.
          </p>
        </div>
      )}
    </section>
  );
}
