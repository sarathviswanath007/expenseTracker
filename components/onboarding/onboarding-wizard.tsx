"use client";

import {
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Check, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { SiteFooter } from "@/components/shell/site-footer";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format-currency";
import { completeOnboarding } from "@/services/budget.service";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import type { Currency } from "@/types/budget";

const TOTAL_STEPS = 6;

const GOAL_OPTIONS = [
  "Save money",
  "Reduce unnecessary expenses",
  "Pay off debt",
  "Build an emergency fund",
  "Plan for a vacation",
  "Invest more",
];

interface IncomeRow {
  source: string;
  amount: string;
  isRecurring: boolean;
}

interface Draft {
  step: number;
  currency: Currency;
  incomeRows: IncomeRow[];
  selectedGoals: string[];
  selectedCategories: string[];
  categoryAmounts: Record<string, string>;
  savingsTarget: string;
}

function draftKey(userId: string) {
  return `budgetwise-onboarding-draft-${userId}`;
}

function defaultDraft(initialGoals: string[]): Draft {
  return {
    step: 1,
    currency: "USD",
    incomeRows: [
      { source: "Salary", amount: "", isRecurring: true },
      { source: "Other income", amount: "", isRecurring: true },
    ],
    selectedGoals: initialGoals,
    selectedCategories: [],
    categoryAmounts: {},
    savingsTarget: "",
  };
}

/** Step title and supporting line, so every step opens the same way. */
function StepHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/** A toggleable pill used for goals and categories. */
function Chip({
  selected,
  children,
  ...props
}: ComponentProps<"button"> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-primary bg-primary/10 text-primary-accent"
          : "border-border bg-background text-foreground hover:bg-muted",
      )}
      {...props}
    >
      {selected && <Check className="size-3.5" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function OnboardingWizard({
  userId,
  initialGoals,
}: {
  userId: string;
  initialGoals: string[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => defaultDraft(initialGoals));
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(draftKey(userId));
    if (saved) {
      try {
        // Reading localStorage must wait for the client-only mount so the
        // server-rendered markup (which has no access to it) still matches
        // on hydration; the resulting extra render is expected here.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraft(JSON.parse(saved));
      } catch {
        // Ignore a corrupted draft and start fresh.
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(next: Draft) {
    setDraft(next);
    localStorage.setItem(draftKey(userId), JSON.stringify(next));
  }

  function goToStep(step: number) {
    setError(null);
    persist({ ...draft, step });
  }

  function updateIncomeRow(index: number, patch: Partial<IncomeRow>) {
    const incomeRows = draft.incomeRows.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    persist({ ...draft, incomeRows });
  }

  function addIncomeRow() {
    persist({
      ...draft,
      incomeRows: [
        ...draft.incomeRows,
        { source: "", amount: "", isRecurring: false },
      ],
    });
  }

  function removeIncomeRow(index: number) {
    persist({
      ...draft,
      incomeRows: draft.incomeRows.filter((_, i) => i !== index),
    });
  }

  function toggleGoal(goal: string) {
    const selectedGoals = draft.selectedGoals.includes(goal)
      ? draft.selectedGoals.filter((g) => g !== goal)
      : [...draft.selectedGoals, goal];
    persist({ ...draft, selectedGoals });
  }

  function toggleCategory(category: string) {
    const selectedCategories = draft.selectedCategories.includes(category)
      ? draft.selectedCategories.filter((c) => c !== category)
      : [...draft.selectedCategories, category];
    persist({ ...draft, selectedCategories });
  }

  function addCustomCategory() {
    const name = customCategory.trim();
    if (!name || draft.selectedCategories.includes(name)) return;
    persist({
      ...draft,
      selectedCategories: [...draft.selectedCategories, name],
    });
    setCustomCategory("");
  }

  function setCategoryAmount(category: string, value: string) {
    persist({
      ...draft,
      categoryAmounts: { ...draft.categoryAmounts, [category]: value },
    });
  }

  function handleNext() {
    setError(null);

    if (draft.step === 2) {
      const hasIncome = draft.incomeRows.some(
        (row) => row.source.trim() && Number(row.amount) > 0,
      );
      if (!hasIncome) {
        setError("Add at least one income source with an amount.");
        return;
      }
    }

    if (draft.step === 4 && draft.selectedCategories.length === 0) {
      setError("Select or add at least one budget category.");
      return;
    }

    goToStep(draft.step + 1);
  }

  async function handleFinish() {
    setError(null);

    const categories = draft.selectedCategories.map((category) => ({
      category,
      allocatedAmount: Number(draft.categoryAmounts[category]) || 0,
    }));

    if (!categories.some((c) => c.allocatedAmount > 0)) {
      setError("Set a budget amount for at least one category.");
      return;
    }

    setSubmitting(true);
    try {
      await completeOnboarding({
        income: draft.incomeRows
          .filter((row) => row.source.trim() && Number(row.amount) > 0)
          .map((row) => ({
            source: row.source.trim(),
            amount: Number(row.amount),
            isRecurring: row.isRecurring,
          })),
        goals: draft.selectedGoals,
        currency: draft.currency,
        savingsTarget: Number(draft.savingsTarget) || 0,
        categories,
      });
      localStorage.removeItem(draftKey(userId));
      setDraft({ ...draft, step: TOTAL_STEPS });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const step = Math.min(draft.step, TOTAL_STEPS);
  const percentComplete = Math.round((step / TOTAL_STEPS) * 100);

  const monthlyIncome = draft.incomeRows.reduce(
    (total, row) => total + (Number(row.amount) || 0),
    0,
  );
  const allocated = draft.selectedCategories.reduce(
    (total, category) => total + (Number(draft.categoryAmounts[category]) || 0),
    0,
  );

  const customCategories = draft.selectedCategories.filter(
    (c) => !DEFAULT_CATEGORIES.includes(c),
  );

  let content: ReactNode = null;

  if (done) {
    content = (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-positive-surface text-positive">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            You&apos;re all set!
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your budget is ready. Start tracking your expenses to see where your
            money goes.
          </p>
        </div>
        <Button
          size="lg"
          className="mt-1 h-10 px-5"
          onClick={() => {
            router.push("/dashboard");
            router.refresh();
          }}
        >
          Go to dashboard
        </Button>
      </div>
    );
  } else if (step === 1) {
    content = (
      <div className="flex flex-col gap-5">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary-accent">
          <LogoMark className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome to BudgetWise AI
          </h1>
          <p className="text-muted-foreground">
            Let&apos;s take control of your money. This will only take a couple
            of minutes.
          </p>
        </div>
        <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
          {[
            "Tell us what you earn each month",
            "Pick the goals and categories that matter to you",
            "Set your budget — we'll track it from there",
          ].map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-accent">
                <Check className="size-3" aria-hidden="true" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    );
  } else if (step === 2) {
    content = (
      <div className="flex flex-col gap-6">
        <StepHeading
          title="Set your monthly income"
          description="Add everything that lands in your account each month."
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={draft.currency}
            onValueChange={(value) =>
              persist({ ...draft, currency: value as Currency })
            }
          >
            <SelectTrigger id="currency" className="h-10 w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="INR">INR (₹)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3">
          {draft.incomeRows.map((row, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3.5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor={`income-source-${index}`}>Source</Label>
                  <Input
                    id={`income-source-${index}`}
                    className="h-10"
                    value={row.source}
                    onChange={(e) =>
                      updateIncomeRow(index, { source: e.target.value })
                    }
                    placeholder="e.g. Salary"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:w-40">
                  <Label htmlFor={`income-amount-${index}`}>Amount</Label>
                  <MoneyInput
                    id={`income-amount-${index}`}
                    currency={draft.currency}
                    className="h-10"
                    value={row.amount}
                    onChange={(e) =>
                      updateIncomeRow(index, { amount: e.target.value })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="size-10 self-end text-muted-foreground hover:text-foreground"
                  onClick={() => removeIncomeRow(index)}
                  disabled={draft.incomeRows.length === 1}
                >
                  <Trash2 aria-hidden="true" />
                  <span className="sr-only">
                    Remove {row.source.trim() || "income source"}
                  </span>
                </Button>
              </div>
              <label className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={row.isRecurring}
                  onCheckedChange={(checked) =>
                    updateIncomeRow(index, { isRecurring: checked === true })
                  }
                />
                Recurring every month
              </label>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 self-start px-3.5"
            onClick={addIncomeRow}
          >
            <Plus aria-hidden="true" />
            Add income source
          </Button>
        </div>

        {monthlyIncome > 0 && (
          <p className="text-sm text-muted-foreground">
            Monthly income:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(monthlyIncome, draft.currency)}
            </span>
          </p>
        )}
      </div>
    );
  } else if (step === 3) {
    content = (
      <div className="flex flex-col gap-6">
        <StepHeading
          title="What are your financial goals?"
          description="Select any that apply — we'll tailor your insights around them."
        />
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((goal) => (
            <Chip
              key={goal}
              selected={draft.selectedGoals.includes(goal)}
              onClick={() => toggleGoal(goal)}
            >
              {goal}
            </Chip>
          ))}
        </div>
      </div>
    );
  } else if (step === 4) {
    content = (
      <div className="flex flex-col gap-6">
        <StepHeading
          title="Create budget categories"
          description="Choose the categories you want to budget for each month."
        />
        <div className="flex flex-wrap gap-2">
          {DEFAULT_CATEGORIES.map((category) => (
            <Chip
              key={category}
              selected={draft.selectedCategories.includes(category)}
              onClick={() => toggleCategory(category)}
            >
              {category}
            </Chip>
          ))}
          {customCategories.map((category) => (
            <Chip
              key={category}
              selected
              onClick={() => toggleCategory(category)}
            >
              {category}
            </Chip>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="custom-category">Add a custom category</Label>
          <div className="flex items-center gap-2">
            <Input
              id="custom-category"
              className="h-10"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomCategory();
                }
              }}
              placeholder="e.g. Gym membership"
            />
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-10 px-3.5"
              onClick={addCustomCategory}
            >
              <Plus aria-hidden="true" />
              Add
            </Button>
          </div>
        </div>
      </div>
    );
  } else if (step === 5) {
    content = (
      <div className="flex flex-col gap-6">
        <StepHeading
          title="Set your monthly budget"
          description="Decide how much of your income each category gets."
        />

        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
          {draft.selectedCategories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between gap-4 p-3.5"
            >
              <Label
                htmlFor={`budget-${category}`}
                className="text-sm font-medium"
              >
                {category}
              </Label>
              <MoneyInput
                id={`budget-${category}`}
                currency={draft.currency}
                className="h-10 w-36"
                value={draft.categoryAmounts[category] ?? ""}
                onChange={(e) => setCategoryAmount(category, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Allocated</span>
          <span className="font-medium tabular-nums">
            {formatCurrency(allocated, draft.currency)}
            {monthlyIncome > 0 && (
              <span className="font-normal text-muted-foreground">
                {" "}
                of {formatCurrency(monthlyIncome, draft.currency)}
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="savings-target">Savings target for the month</Label>
          <MoneyInput
            id="savings-target"
            currency={draft.currency}
            className="h-10 sm:w-52"
            value={draft.savingsTarget}
            onChange={(e) =>
              persist({ ...draft, savingsTarget: e.target.value })
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-muted/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/">
            <Logo />
          </Link>
          {!done && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Skip for now
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {!done && (
            <div className="mb-8 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>
                  Step {step} of {TOTAL_STEPS}
                </span>
                <span className="tabular-nums">
                  {percentComplete}% complete
                </span>
              </div>
              <Progress value={percentComplete} />
            </div>
          )}

          {content}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-critical-surface px-3 py-2 text-sm text-critical"
            >
              {error}
            </p>
          )}

          {!done && (
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="h-10 px-3"
                  onClick={() => goToStep(step - 1)}
                >
                  <ArrowLeft aria-hidden="true" />
                  Back
                </Button>
              ) : (
                <span />
              )}
              <Button
                size="lg"
                className="h-10 px-5"
                disabled={submitting}
                onClick={step === 5 ? handleFinish : handleNext}
              >
                {step === 1 && "Get started"}
                {step > 1 && step < 5 && "Continue"}
                {step === 5 &&
                  (submitting ? "Setting things up..." : "Finish setup")}
              </Button>
            </div>
          )}
        </div>

        {!done && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            You can change any of this later in Settings.
          </p>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
