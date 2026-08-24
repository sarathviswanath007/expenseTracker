"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { X } from "lucide-react";
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

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  GBP: "£",
  USD: "$",
};

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
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const symbol = CURRENCY_SYMBOLS[draft.currency];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Step {Math.min(draft.step, TOTAL_STEPS)} of {TOTAL_STEPS}
        </p>
        <Button
          render={<Link href="/dashboard" />}
          variant="ghost"
          size="sm"
        >
          <X className="size-4" aria-hidden="true" />
          Skip for now
        </Button>
      </div>
      <Progress value={(Math.min(draft.step, TOTAL_STEPS) / TOTAL_STEPS) * 100} />

      {draft.step === 1 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">
            Welcome to BudgetWise AI
          </h1>
          <p className="text-muted-foreground">
            Let&apos;s take control of your money. This will only take a
            couple of minutes.
          </p>
          <Button onClick={handleNext}>Get started</Button>
        </div>
      )}

      {draft.step === 2 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Set your monthly income</h2>
          <div className="flex flex-col gap-1.5">
            <Label>Currency</Label>
            <Select
              value={draft.currency}
              onValueChange={(value) =>
                persist({ ...draft, currency: value as Currency })
              }
            >
              <SelectTrigger className="w-full">
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
              <div key={index} className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label>Source</Label>
                    <Input
                      value={row.source}
                      onChange={(e) =>
                        updateIncomeRow(index, { source: e.target.value })
                      }
                      placeholder="e.g. Salary"
                    />
                  </div>
                  <div className="flex w-28 flex-col gap-1.5">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      value={row.amount}
                      onChange={(e) =>
                        updateIncomeRow(index, { amount: e.target.value })
                      }
                      placeholder={`${symbol}0`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIncomeRow(index)}
                  >
                    Remove
                  </Button>
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
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
              size="sm"
              onClick={addIncomeRow}
            >
              Add another income source
            </Button>
          </div>
        </div>
      )}

      {draft.step === 3 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">
            What are your financial goals?
          </h2>
          <p className="text-muted-foreground text-sm">Select any that apply.</p>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((goal) => (
              <Button
                key={goal}
                type="button"
                variant={
                  draft.selectedGoals.includes(goal) ? "default" : "outline"
                }
                size="sm"
                onClick={() => toggleGoal(goal)}
              >
                {goal}
              </Button>
            ))}
          </div>
        </div>
      )}

      {draft.step === 4 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Create budget categories</h2>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_CATEGORIES.map((category) => (
              <Button
                key={category}
                type="button"
                variant={
                  draft.selectedCategories.includes(category)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Button>
            ))}
            {draft.selectedCategories
              .filter((c) => !DEFAULT_CATEGORIES.includes(c))
              .map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Button>
              ))}
          </div>
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>Add a custom category</Label>
              <Input
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
            </div>
            <Button type="button" variant="outline" onClick={addCustomCategory}>
              Add
            </Button>
          </div>
        </div>
      )}

      {draft.step === 5 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Set your monthly budget</h2>
          <div className="flex flex-col gap-3">
            {draft.selectedCategories.map((category) => (
              <div key={category} className="flex items-center gap-2">
                <Label className="w-32 shrink-0">{category}</Label>
                <Input
                  type="number"
                  min="0"
                  value={draft.categoryAmounts[category] ?? ""}
                  onChange={(e) => setCategoryAmount(category, e.target.value)}
                  placeholder={`${symbol}0`}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Savings target for the month</Label>
            <Input
              type="number"
              min="0"
              value={draft.savingsTarget}
              onChange={(e) =>
                persist({ ...draft, savingsTarget: e.target.value })
              }
              placeholder={`${symbol}0`}
            />
          </div>
        </div>
      )}

      {draft.step === 6 && done && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">You&apos;re all set!</h1>
          <p className="text-muted-foreground">
            Your budget is ready. Start tracking your expenses to see where
            your money goes.
          </p>
          <Button
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
          >
            Go to dashboard
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Step 1 has its own "Get started" call to action, so the Back/Continue
          footer would only repeat it. */}
      {draft.step > 1 && draft.step < 6 && (
        <div className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => goToStep(draft.step - 1)}
          >
            Back
          </Button>
          {draft.step === 5 ? (
            <Button onClick={handleFinish} disabled={submitting}>
              {submitting ? "Setting things up..." : "Finish setup"}
            </Button>
          ) : (
            <Button onClick={handleNext}>Continue</Button>
          )}
        </div>
      )}
    </div>
  );
}
