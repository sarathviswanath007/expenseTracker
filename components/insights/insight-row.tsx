"use client";

import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  Lightbulb,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Insight, InsightTone } from "@/lib/insight-rules";

const TONE = {
  critical: {
    icon: CircleAlert,
    badge: "bg-critical-surface text-critical",
    border: "border-critical/30",
    label: "Needs attention",
  },
  attention: {
    icon: TriangleAlert,
    badge: "bg-primary/10 text-primary-accent",
    border: "border-primary/25",
    label: "Heads up",
  },
  positive: {
    icon: TrendingUp,
    badge: "bg-positive-surface text-positive",
    border: "border-positive/30",
    label: "Going well",
  },
  neutral: {
    icon: Lightbulb,
    badge: "bg-muted text-muted-foreground",
    border: "border-border",
    label: "Suggestion",
  },
} satisfies Record<
  InsightTone,
  { icon: typeof CircleAlert; badge: string; border: string; label: string }
>;

export { TONE };

export function InsightRow({ insight }: { insight: Insight }) {
  const tone = TONE[insight.tone];
  const Icon = tone.icon;

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-card p-4",
        tone.border,
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          tone.badge,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-medium">{insight.title}</p>
        <p className="text-sm text-pretty text-muted-foreground">
          {insight.detail}
        </p>
        {insight.action && (
          <Button
            render={<Link href={insight.action.href} />}
            nativeButton={false}
            variant="ghost"
            size="xs"
            className="mt-1 self-start"
          >
            {insight.action.label}
            <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </li>
  );
}
