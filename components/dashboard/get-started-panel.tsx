"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Receipt,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
      "Record something you've spent. It gets counted against the category budget you just set.",
    href: "/expenses",
    cta: "Log an expense",
    icon: Receipt,
  },
];

export function GetStartedPanel({ setup }: { setup: SetupStatus }) {
  const done = STEPS.filter((s) => setup[s.key]).length;
  const nextStep = STEPS.find((s) => !setup[s.key]);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative border-b border-border bg-primary/[0.05] p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-primary/10 blur-2xl"
        />
        <div className="relative flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-card px-2.5 py-1 text-xs font-medium text-primary-accent">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Getting started
          </span>
          <h2 className="text-xl font-semibold tracking-tight">
            Let&apos;s set up your first budget
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            BudgetWise works by comparing two things: your{" "}
            <span className="font-medium text-foreground">plan</span> and your{" "}
            <span className="font-medium text-foreground">reality</span>.
          </p>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Wallet
                  className="size-4 text-primary-accent"
                  aria-hidden="true"
                />
                A budget is your plan
              </p>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                How much you <em>intend</em> to spend this month — say $400 on
                food, $150 on transport.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Receipt
                  className="size-4 text-primary-accent"
                  aria-hidden="true"
                />
                An expense is what really happened
              </p>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                Each purchase you log — a $12 lunch, a $60 grocery run — counts
                against that plan.
              </p>
            </div>
          </div>

          <p className="mt-2 max-w-xl text-sm text-muted-foreground text-pretty">
            Once both exist, BudgetWise shows how much of each budget
            you&apos;ve used, warns you before you run out, and points out what
            changed since last month.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(done / STEPS.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {done} of {STEPS.length} done
            </span>
          </div>
        </div>
      </div>

      <ol className="divide-y divide-border">
        {STEPS.map((step, index) => {
          const complete = setup[step.key];
          const isNext = nextStep?.key === step.key;
          const Icon = step.icon;
          return (
            <li
              key={step.key}
              className={cn(
                "flex flex-wrap items-center gap-4 p-4 transition-colors",
                isNext && "bg-primary/[0.03]",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  complete
                    ? "bg-positive-surface text-positive"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {complete ? (
                  <Check className="size-4.5" aria-hidden="true" />
                ) : (
                  <Icon className="size-4.5" aria-hidden="true" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-medium",
                    complete && "text-muted-foreground line-through",
                  )}
                >
                  <span className="text-muted-foreground">{index + 1}. </span>
                  {step.title}
                </p>
                <p className="text-sm text-muted-foreground text-pretty">
                  {step.detail}
                </p>
              </div>

              {complete ? (
                <span className="text-sm font-medium text-positive">Done</span>
              ) : (
                <Button
                  render={<Link href={step.href} />}
                  variant={isNext ? "default" : "outline"}
                  size="sm"
                >
                  {step.cta}
                  {isNext && (
                    <ArrowRight className="size-4" aria-hidden="true" />
                  )}
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
