import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Download,
  Receipt,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroPreview } from "@/components/marketing/hero-preview";
import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/shell/site-footer";

const PROBLEMS = [
  {
    problem: "I don't know where my money goes.",
    solution:
      "Every expense is categorized, so you see exactly which categories take the biggest share each month.",
    icon: Search,
  },
  {
    problem: "Budgets never survive the month.",
    solution:
      "Set a per-category limit and get warned as you approach it — before you blow past it.",
    icon: Wallet,
  },
  {
    problem: "Charts tell me what happened, not what to do.",
    solution:
      "Spending changes are surfaced with a suggested next step, not just another graph to interpret.",
    icon: Brain,
  },
];

const FEATURES = [
  {
    title: "Smart expense tracking",
    description:
      "Log an expense in seconds with category, payment method, and notes. Filter and search your whole history.",
    icon: Receipt,
  },
  {
    title: "Budget planning",
    description:
      "Build a budget per month and category, copy last month forward, and set your own alert thresholds.",
    icon: Wallet,
  },
  {
    title: "AI financial insights",
    description:
      "See which categories moved, by how much, and what to do about it — with the numbers behind every claim.",
    icon: Sparkles,
  },
  {
    title: "Spending analytics",
    description:
      "Category breakdowns, six-month trends, budget vs actual, and income vs expense — all in one place.",
    icon: BarChart3,
  },
  {
    title: "Savings goals",
    description:
      "Track what you're saving toward, how far along you are, and when you're on pace to get there.",
    icon: Target,
  },
  {
    title: "Monthly reports",
    description:
      "Export your expenses, budgets, and analytics as CSV, Excel, or PDF whenever you need them.",
    icon: Download,
  },
];

const STEPS = [
  {
    step: "1",
    title: "Set your budget",
    detail:
      "Add your income, pick your categories, and set a monthly limit for each one.",
  },
  {
    step: "2",
    title: "Track as you spend",
    detail:
      "Log expenses as they happen. Everything lands in the right category automatically.",
  },
  {
    step: "3",
    title: "Act on what you learn",
    detail:
      "See what changed, where you're overspending, and what to adjust next month.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
              Log in
            </Link>
            <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="border-b border-border">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-2 lg:py-20">
            <div className="flex flex-col items-start gap-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" />
                AI-powered budgeting
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Understand your money. Make smarter decisions.
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                BudgetWise AI tracks your income and expenses, keeps your
                budgets honest, and tells you what changed each month — and what
                to do about it.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Get started free
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#how-it-works"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                  )}
                >
                  See how it works
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Free to start · No card required
              </p>
            </div>

            <div className="lg:pl-4">
              <HeroPreview />
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <div className="mb-8 flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                The problem isn&apos;t discipline. It&apos;s visibility.
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                Most budgeting tools show you what already happened. BudgetWise
                AI is built to tell you what it means.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {PROBLEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.problem}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <p className="font-medium text-balance">
                      &ldquo;{item.problem}&rdquo;
                    </p>
                    <p className="text-sm text-muted-foreground text-pretty">
                      {item.solution}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <div className="mb-8 flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Everything you need to stay on top of it
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                One place for your budget, your spending, and the story they
                tell together.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-16 border-b border-border bg-muted/30"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <div className="mb-8 flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                How it works
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                Three steps, and about five minutes to set up.
              </p>
            </div>
            <ol className="grid gap-4 md:grid-cols-3">
              {STEPS.map((item) => (
                <li
                  key={item.step}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {item.step}
                  </span>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary">
                <Brain className="size-3.5" aria-hidden="true" />
                Your AI financial coach
              </span>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-balance">
                Not another chart. An actual next step.
              </h2>
              <p className="text-muted-foreground text-pretty">
                BudgetWise AI compares this month against your history and your
                budget, then surfaces what moved and what it costs you — with
                the real numbers attached, so you can check its work.
              </p>
              <ul className="flex flex-col gap-2 text-sm">
                {[
                  "Spot categories that jumped before the month ends",
                  "Get warned as you approach a limit, not after",
                  "See the spending behind every recommendation",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <TrendingUp
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <p className="font-medium">What changed this month</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm">
                    <span className="font-medium text-critical">
                      Over budget:
                    </span>{" "}
                    Shopping is ₹1,500 past its ₹8,000 limit.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm">
                    <span className="font-medium">Food</span> spending is up{" "}
                    <span className="font-medium">18%</span> vs last month —
                    ₹12,500 after ₹10,600.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm">
                    <span className="font-medium">Transport</span> spending is
                    down <span className="font-medium">20%</span> vs last month
                    — ₹6,000 after ₹7,500.
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Illustrative sample data
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-6 py-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Start understanding your money today
            </h2>
            <p className="text-muted-foreground text-pretty">
              Set up your first budget in a few minutes and see where you
              actually stand.
            </p>
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
              Get started free
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter note="Track smarter. Spend better. Save more." />
    </div>
  );
}
