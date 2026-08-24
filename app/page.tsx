import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const problems = [
  "Knowing how to create a realistic budget",
  "Tracking expenses consistently",
  "Understanding where their money is going",
  "Identifying unnecessary spending",
  "Managing monthly budget limits",
  "Getting actionable financial guidance instead of just charts",
];

const features = [
  {
    title: "Guided budgeting",
    description:
      "Set income, goals, and category budgets in a few simple steps — no spreadsheets required.",
  },
  {
    title: "Effortless expense tracking",
    description:
      "Log expenses in seconds, organize them by category, and see exactly where your money goes.",
  },
  {
    title: "AI-powered guidance",
    description:
      "Get personalized recommendations that go beyond charts — real advice on what to do next.",
  },
  {
    title: "Goals you can watch grow",
    description:
      "Track savings goals with clear progress and an estimated date you'll reach them.",
  },
];

const steps = [
  { label: "Track", detail: "See where your money goes." },
  { label: "Analyze", detail: "Understand why you're spending more." },
  { label: "Guide", detail: "Get a clear plan to improve." },
];

const benefits = [
  "Spend less time managing spreadsheets",
  "Catch overspending before it becomes a problem",
  "Build savings habits with personalized nudges",
  "One place for budgets, expenses, and goals",
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4 sm:px-12">
        <span className="text-lg font-semibold">BudgetWise AI</span>
        <nav className="flex items-center gap-3">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
            Log in
          </Link>
          <Link href="/signup" className={cn(buttonVariants())}>
            Sign up
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center gap-6 px-6 py-24 text-center sm:px-12">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Track smarter. Spend better. Save more.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            BudgetWise AI is a personal budgeting assistant that helps you
            create, manage, analyze, and optimize your expenses — with AI
            guidance, not just charts.
          </p>
          <div className="flex gap-3">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
              Get started free
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Log in
            </Link>
          </div>
        </section>

        <section className="border-t bg-muted/30 px-6 py-16 sm:px-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-semibold">
              Budgeting apps show you reports. We help you act.
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {problems.map((problem) => (
                <li
                  key={problem}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                  {problem}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-semibold">
              Key features
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 px-6 py-16 sm:px-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold">
              How it works
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.label} className="text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                    {index + 1}
                  </div>
                  <p className="mt-3 font-medium">{step.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold">Benefits</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t px-6 py-16 text-center sm:px-12">
          <h2 className="text-2xl font-semibold">
            Ready to take control of your money?
          </h2>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
              Create your account
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Log in
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground sm:px-12">
        BudgetWise AI
      </footer>
    </div>
  );
}
