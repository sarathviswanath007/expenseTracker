"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format-currency";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import {
  copyPreviousMonthBudget,
  deleteBudget,
  saveBudget,
  type BudgetWithCategories,
} from "@/services/budget.service";
import type { Currency } from "@/types/budget";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
}: {
  month: number;
  year: number;
  budget: BudgetWithCategories | null;
}) {
  const router = useRouter();
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
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
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
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to copy previous budget.",
      );
    } finally {
      setCopying(false);
    }
  }

  const total = rows.reduce((sum, r) => sum + (Number(r.allocatedAmount) || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Budget Management</h1>
        <p className="text-muted-foreground text-sm">
          Plan how much to spend in each category, month by month.
        </p>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <Label>Month</Label>
          <Select
            value={String(month)}
            onValueChange={(value) => changeMonthYear(Number(value), year)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((name, index) => (
                <SelectItem key={name} value={String(index + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Year</Label>
          <Select
            value={String(year)}
            onValueChange={(value) => changeMonthYear(month, Number(value))}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[year - 1, year, year + 1].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!showForm && (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-6">
          <p className="text-muted-foreground">
            No budget yet for {MONTH_NAMES[month - 1]} {year}.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(true)}>Create budget</Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyPrevious}
              disabled={copying}
            >
              {copying ? "Copying..." : "Copy previous month's budget"}
            </Button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={(value) => setCurrency(value as Currency)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>Savings target</Label>
              <Input
                type="number"
                min="0"
                value={savingsTarget}
                onChange={(e) => setSavingsTarget(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Categories</Label>
            {rows.map((row) => (
              <div key={row.key} className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Input
                    value={row.category}
                    onChange={(e) =>
                      updateRow(row.key, { category: e.target.value })
                    }
                    placeholder="Category name"
                  />
                </div>
                <div className="flex w-28 flex-col gap-1.5">
                  <Input
                    type="number"
                    min="0"
                    value={row.allocatedAmount}
                    onChange={(e) =>
                      updateRow(row.key, { allocatedAmount: e.target.value })
                    }
                    placeholder="Amount"
                  />
                </div>
                <div className="flex w-24 flex-col gap-1.5">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={row.alertThresholdPercent}
                    onChange={(e) =>
                      updateRow(row.key, {
                        alertThresholdPercent: e.target.value,
                      })
                    }
                    placeholder="Alert %"
                    title="Alert threshold (% of category budget)"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(row.key)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRows((prev) => [...prev, newRow()])}
            >
              Add category
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Total planned: {formatCurrency(total, currency)}
          </p>

          <div className="flex justify-between">
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
        </div>
      )}
    </div>
  );
}
