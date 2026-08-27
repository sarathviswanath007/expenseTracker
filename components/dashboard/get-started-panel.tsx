"use client";

import Link from "next/link";
import { ArrowRight, Receipt, Wallet, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SetupStatus } from "@/types/analytics";

interface Step {
  key: keyof SetupStatus;
  title: string;
  detail: string;
  href: string;
  cta: string;
  icon: LucideIcon;
}

const STEPS: Step[] = [
  {
    key: "hasAnyBudget",
    title: "Set up your budget",
    detail:
      "Add your income, choose categories, and set a monthly limit for each one.",
    href: "/onboarding",
    cta: "Start setup",
    icon: Wallet,
  },
  {
    key: "hasAnyExpense",
    title: "Log your first expense",
    detail:
      "Record something you've spent — it counts against the category budget you set.",
    href: "/expenses",
    cta: "Log an expense",
    icon: Receipt,
  },
];

/**
 * A single-line prompt for the one thing left to do. Once both steps are
 * done the dashboard has real data to show, so this disappears entirely.
 */
export function GetStartedPanel({ setup }: { setup: SetupStatus }) {
  const nextStep = STEPS.find((step) => !setup[step.key]);
  if (!nextStep) return null;

  const done = STEPS.filter((step) => setup[step.key]).length;
  const Icon = nextStep.icon;

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-accent">
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="font-medium">{nextStep.title}</h2>
        <p className="text-sm text-pretty text-muted-foreground">
          {nextStep.detail}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Step {done + 1} of {STEPS.length}
        </span>
        <Button render={<Link href={nextStep.href} />} nativeButton={false}>
          {nextStep.cta}
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
