"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/shell/page-container";
import {
  MonthYearPicker,
  PageToolbar,
} from "@/components/shell/month-year-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format-currency";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { MONTH_NAMES } from "@/lib/dates";
import { IncomeManager } from "@/components/budget/income-manager";
import {
  copyPreviousMonthBudget,
  deleteBudget,
  saveBudget,
  type BudgetWithCategories,
  type IncomeRecord,
} from "@/services/budget.service";
import type { Currency } from "@/types/budget";

interface CategoryRow {
  key: string;
  id?: string;
  category: string;
  allocatedAmount: string;
  alertThresholdPercent: string;
}

function newRow(category = ""): CategoryRow {
  return {
    key: crypto.randomUUID(),
    category,
    allocatedAmount: "",
    alertThresholdPercent: "85",
  };
}

function rowsFromBudget(budget: BudgetWithCategories): CategoryRow[] {
  return budget.categories.map((c) => ({
    key: c.id,
    id: c.id,
    category: c.category,
    allocatedAmount: String(c.allocatedAmount),
    alertThresholdPercent: String(c.alertThresholdPercent),
  }));
}

export function BudgetManager({
  month,
  year,
  budget,
  income,
}: {
  month: number;
  year: number;
  budget: BudgetWithCategories | null;
  income: IncomeRecord[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(Boolean(budget));
  const [currency, setCurrency] = useState<Currency>(budget?.currency ?? "USD");
  const [savingsTarget, setSavingsTarget] = useState(
    budget ? String(budget.savingsTarget) : "",
  );
  const [rows, setRows] = useState<CategoryRow[]>(
    budget ? rowsFromBudget(budget) : DEFAULT_CATEGORIES.map((c) => newRow(c)),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function updateRow(key: string, patch: Partial<CategoryRow>) {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function changeMonthYear(nextMonth: number, nextYear: number) {
    router.push(`/budgets?month=${nextMonth}&year=${nextYear}`);
  }

  async function handleSave() {
    setError(null);

    const cleaned = rows
      .filter((r) => r.category.trim())
      .map((r) => ({
        id: r.id,
        category: r.category.trim(),
        allocatedAmount: Number(r.allocatedAmount) || 0,
        alertThresholdPercent: Math.min(
          100,
          Math.max(1, Number(r.alertThresholdPercent) || 85),
        ),
      }));

    if (cleaned.length === 0) {
      setError("Add at least one budget category.");
      return;
    }

    setSaving(true);
    try {
      await saveBudget({
        budgetId: budget?.id,
        month,
        year,
        currency,
        savingsTarget: Number(savingsTarget) || 0,
        categories: cleaned,
      });
      toast(budget ? "Budget updated." : "Budget saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save budget.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!budget) return;
    if (!confirm(`Delete the budget for ${MONTH_NAMES[month - 1]} ${year}?`)) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteBudget(budget.id);
      toast("Budget deleted.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete budget.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleCopyPrevious() {
    setCopying(true);
    setError(null);
    try {
      await copyPreviousMonthBudget(month, year);
      toast("Last month's budget copied over.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to copy previous budget.",
      );
    } finally {
      setCopying(false);
    }
  }

  const total = rows.reduce(
    (sum, r) => sum + (Number(r.allocatedAmount) || 0),
    0,
  );

  return (
    <PageContainer width="narrow">
      <PageToolbar context={`Budget for ${MONTH_NAMES[month - 1]} ${year}`}>
        <MonthYearPicker month={month} year={year} onChange={changeMonthYear} />
      </PageToolbar>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-critical-surface px-3 py-2 text-sm text-critical"
        >
          {error}
        </p>
      )}

      <IncomeManager income={income} currency={currency} />

      {!showForm && (
        <EmptyState
          icon={Wallet}
          title={`No budget yet for ${MONTH_NAMES[month - 1]} ${year}`}
          description="Set a limit per category so you can see how the month is tracking — or start from last month's plan."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => setShowForm(true)}>Create budget</Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyPrevious}
                disabled={copying}
              >
                {copying ? "Copying..." : "Copy last month"}
              </Button>
            </div>
          }
        />
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {MONTH_NAMES[month - 1]} {year} budget
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="budget-currency">Currency</Label>
                <Select
                  value={currency}
                  onValueChange={(value) => setCurrency(value as Currency)}
                >
                  <SelectTrigger id="budget-currency" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex min-w-40 flex-1 flex-col gap-1.5">
                <Label htmlFor="budget-savings-target">Savings target</Label>
                <MoneyInput
                  id="budget-savings-target"
                  currency={currency}
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Categories</Label>
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                <div className="hidden items-center gap-2 bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
                  <span className="flex-1">Category</span>
                  <span className="w-28">Budget</span>
                  <span className="w-24">Alert at %</span>
                  <span className="w-8" aria-hidden="true" />
                </div>
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center"
                  >
                    <Input
                      className="w-full sm:flex-1"
                      value={row.category}
                      onChange={(e) =>
                        updateRow(row.key, { category: e.target.value })
                      }
                      placeholder="Category name"
                      aria-label="Category name"
                    />
                    <div className="flex items-center gap-2">
                      <MoneyInput
                        className="flex-1 sm:w-28 sm:flex-none"
                        currency={currency}
                        value={row.allocatedAmount}
                        onChange={(e) =>
                          updateRow(row.key, {
                            allocatedAmount: e.target.value,
                          })
                        }
                        aria-label={`Budget for ${row.category || "category"}`}
                      />
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        className="w-20 shrink-0 tabular-nums sm:w-24"
                        value={row.alertThresholdPercent}
                        onChange={(e) =>
                          updateRow(row.key, {
                            alertThresholdPercent: e.target.value,
                          })
                        }
                        placeholder="85"
                        title="Alert threshold (% of category budget)"
                        aria-label={`Alert threshold for ${row.category || "category"}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => removeRow(row.key)}
                      >
                        <Trash2 aria-hidden="true" />
                        <span className="sr-only">
                          Remove {row.category || "category"}
                        </span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setRows((prev) => [...prev, newRow()])}
              >
                <Plus aria-hidden="true" />
                Add category
              </Button>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
              <span className="text-muted-foreground">Total planned</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(total, currency)}
              </span>
            </div>

            <div className="flex justify-between gap-2">
              {budget ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete budget"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save budget"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
