"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format-currency";
import {
  createIncome,
  deleteIncome,
  updateIncome,
  type IncomeRecord,
} from "@/services/budget.service";
import type { Currency } from "@/types/budget";

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The income rows behind the dashboard's income figure. Onboarding creates
 * them; this is where they get corrected or removed.
 */
export function IncomeManager({
  income,
  currency,
}: {
  income: IncomeRecord[];
  currency: Currency;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [rows, setRows] = useState(income);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newSource, setNewSource] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newRecurring, setNewRecurring] = useState(true);

  const monthlyTotal = rows
    .filter((row) => row.isRecurring)
    .reduce((sum, row) => sum + row.amount, 0);

  function patchRow(id: string, patch: Partial<IncomeRecord>) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  async function handleSave(row: IncomeRecord) {
    setError(null);
    if (!row.source.trim()) {
      setError("Give the income source a name.");
      return;
    }
    if (!Number.isFinite(row.amount) || row.amount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setBusyId(row.id);
    try {
      await updateIncome(row.id, {
        source: row.source.trim(),
        amount: row.amount,
        isRecurring: row.isRecurring,
        incomeDate: row.incomeDate,
      });
      toast(`${row.source.trim()} updated.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save income.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(row: IncomeRecord) {
    setError(null);
    setBusyId(row.id);
    try {
      await deleteIncome(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      toast(`${row.source.trim() || "Income source"} deleted.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete income.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleAdd() {
    setError(null);
    const amount = Number(newAmount);
    if (!newSource.trim()) {
      setError("Give the income source a name.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setAdding(true);
    try {
      await createIncome({
        source: newSource.trim(),
        amount,
        isRecurring: newRecurring,
        incomeDate: today(),
      });
      toast(`${newSource.trim()} added.`);
      setNewSource("");
      setNewAmount("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add income.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income</CardTitle>
        <p className="text-sm text-muted-foreground">
          Recurring sources count toward every month from their date onward.
          {rows.length > 0 && (
            <>
              {" "}
              This month:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(monthlyTotal, currency)}
              </span>
              .
            </>
          )}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-critical-surface px-3 py-2 text-sm text-critical"
          >
            {error}
          </p>
        )}

        {rows.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No income recorded"
            description="Add what you earn each month so savings and remaining budget mean something."
          />
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
              <span className="flex-1">Source</span>
              <span className="w-32">Amount</span>
              <span className="w-24">Monthly</span>
              <span className="w-8" aria-hidden="true" />
            </div>
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-2 p-3">
                <Input
                  className="flex-1"
                  value={row.source}
                  onChange={(e) => patchRow(row.id, { source: e.target.value })}
                  onBlur={() => handleSave(row)}
                  aria-label="Income source"
                />
                <MoneyInput
                  className="w-32"
                  currency={currency}
                  value={String(row.amount)}
                  onChange={(e) =>
                    patchRow(row.id, { amount: Number(e.target.value) })
                  }
                  onBlur={() => handleSave(row)}
                  aria-label={`Amount for ${row.source || "income"}`}
                />
                <label className="flex w-24 items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={row.isRecurring}
                    onCheckedChange={(checked) => {
                      const isRecurring = checked === true;
                      patchRow(row.id, { isRecurring });
                      handleSave({ ...row, isRecurring });
                    }}
                    aria-label={`${row.source || "Income"} repeats monthly`}
                  />
                  Monthly
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => handleDelete(row)}
                  disabled={busyId === row.id}
                >
                  <Trash2 aria-hidden="true" />
                  <span className="sr-only">
                    Delete {row.source || "income source"}
                  </span>
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-40 flex-1 flex-col gap-1.5">
            <Label htmlFor="new-income-source">Add a source</Label>
            <Input
              id="new-income-source"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              placeholder="e.g. Salary"
            />
          </div>
          <div className="flex w-32 flex-col gap-1.5">
            <Label htmlFor="new-income-amount">Amount</Label>
            <MoneyInput
              id="new-income-amount"
              currency={currency}
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
          </div>
          <label className="flex h-8 items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={newRecurring}
              onCheckedChange={(checked) => setNewRecurring(checked === true)}
            />
            Monthly
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={handleAdd}
            disabled={adding}
          >
            <Plus aria-hidden="true" />
            {adding ? "Adding..." : "Add"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
