"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/categories";
import { getExpenseFormErrors } from "@/lib/expense-validation";
import { createExpense } from "@/services/expense.service";
import type { Currency } from "@/types/budget";

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The dashboard's one write action: log what you just spent without
 * detouring to the Expenses page.
 */
export function QuickAddExpense({
  categories,
  currency,
}: {
  categories: string[];
  currency: Currency;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [date, setDate] = useState(today());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PAYMENT_METHODS[0],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    setError(null);

    const errors = getExpenseFormErrors({
      amount,
      category,
      date,
      paymentMethod,
    });
    const firstError =
      errors.amount ?? errors.category ?? errors.date ?? errors.paymentMethod;
    if (firstError) {
      setError(firstError);
      return;
    }

    setSaving(true);
    try {
      await createExpense({
        amount: Number(amount),
        category,
        date,
        paymentMethod,
        description: null,
      });
      setAmount("");
      toast(`${category} expense added.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="font-medium">Quick add</h2>
        <p className="text-sm text-muted-foreground">
          Log what you just spent.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quick-amount">Amount</Label>
          <MoneyInput
            id="quick-amount"
            currency={currency}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quick-category">Category</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value ?? "")}
          >
            <SelectTrigger id="quick-category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quick-date">Date</Label>
          <Input
            id="quick-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quick-payment">Payment method</Label>
          <Select
            value={paymentMethod}
            onValueChange={(value) =>
              setPaymentMethod((value as PaymentMethod) ?? PAYMENT_METHODS[0])
            }
          >
            <SelectTrigger id="quick-payment" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-critical-surface px-3 py-2 text-sm text-critical"
        >
          {error}
        </p>
      )}

      <div className="mt-auto">
        <Button onClick={handleAdd} disabled={saving} className="w-full">
          <Plus aria-hidden="true" />
          {saving ? "Adding..." : "Add expense"}
        </Button>
      </div>
    </div>
  );
}
