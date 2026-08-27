"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/shell/page-container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/categories";
import { formatCurrency } from "@/lib/format-currency";
import type { Currency } from "@/types/budget";
import { getExpenseFormErrors } from "@/lib/expense-validation";
import {
  createExpense,
  deleteExpense,
  updateExpense,
} from "@/services/expense.service";
import type { Expense } from "@/types/expense";

function today() {
  return new Date().toISOString().slice(0, 10);
}

interface FormState {
  amount: string;
  category: string;
  date: string;
  paymentMethod: string;
  description: string;
}

function emptyForm(defaultCategory: string): FormState {
  return {
    amount: "",
    category: defaultCategory,
    date: today(),
    paymentMethod: PAYMENT_METHODS[0],
    description: "",
  };
}

function formFromExpense(expense: Expense): FormState {
  return {
    amount: String(expense.amount),
    category: expense.category,
    date: expense.expenseDate,
    paymentMethod: expense.paymentMethod,
    description: expense.description ?? "",
  };
}

export function ExpenseManager({
  categories,
  expenses,
  total,
  pageSize,
  page,
  filters,
  currency,
}: {
  categories: string[];
  currency: Currency;
  expenses: Expense[];
  total: number;
  pageSize: number;
  page: number;
  filters: {
    category?: string;
    from?: string;
    to?: string;
    search?: string;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(() =>
    emptyForm(categories[0] ?? ""),
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState(filters.category ?? "");
  const [filterFrom, setFilterFrom] = useState(filters.from ?? "");
  const [filterTo, setFilterTo] = useState(filters.to ?? "");
  const [filterSearch, setFilterSearch] = useState(filters.search ?? "");

  function applyFilters() {
    const params = new URLSearchParams();
    if (filterCategory) params.set("category", filterCategory);
    if (filterFrom) params.set("from", filterFrom);
    if (filterTo) params.set("to", filterTo);
    if (filterSearch) params.set("search", filterSearch);
    router.push(`/expenses?${params.toString()}`);
  }

  function clearFilters() {
    setFilterCategory("");
    setFilterFrom("");
    setFilterTo("");
    setFilterSearch("");
    router.push("/expenses");
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.search) params.set("search", filters.search);
    params.set("page", String(nextPage));
    router.push(`/expenses?${params.toString()}`);
  }

  async function handleAdd() {
    const errors = getExpenseFormErrors(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await createExpense({
        category: form.category,
        amount: Number(form.amount),
        date: form.date,
        paymentMethod: form.paymentMethod as PaymentMethod,
        description: form.description.trim() || null,
      });
      setForm(emptyForm(categories[0] ?? ""));
      toast("Expense added.");
      router.refresh();
    } catch (err) {
      setFormErrors({
        amount: err instanceof Error ? err.message : "Failed to add expense.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(expense: Expense) {
    setEditingId(expense.id);
    setEditForm(formFromExpense(expense));
    setEditErrors({});
    setActionError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setEditErrors({});
  }

  async function handleSaveEdit(id: string) {
    if (!editForm) return;
    const errors = getExpenseFormErrors(editForm);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBusyId(id);
    setActionError(null);
    try {
      await updateExpense(id, {
        category: editForm.category,
        amount: Number(editForm.amount),
        date: editForm.date,
        paymentMethod: editForm.paymentMethod as PaymentMethod,
        description: editForm.description.trim() || null,
      });
      cancelEdit();
      toast("Expense updated.");
      router.refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update expense.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    setBusyId(id);
    setActionError(null);
    try {
      await deleteExpense(id);
      toast("Expense deleted.");
      router.refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete expense.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const hasFilters = Boolean(
    filters.category || filters.from || filters.to || filters.search,
  );

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle>Add an expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex w-28 flex-col gap-1.5">
              <Label htmlFor="expense-amount">Amount</Label>
              <MoneyInput
                id="expense-amount"
                currency={currency}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="flex w-40 flex-col gap-1.5">
              <Label htmlFor="expense-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm({ ...form, category: value ?? "" })
                }
              >
                <SelectTrigger id="expense-category" className="w-full">
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
            <div className="flex w-40 flex-col gap-1.5">
              <Label htmlFor="expense-date">Date</Label>
              <Input
                id="expense-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="flex w-40 flex-col gap-1.5">
              <Label htmlFor="expense-payment">Payment method</Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    paymentMethod: value ?? PAYMENT_METHODS[0],
                  })
                }
              >
                <SelectTrigger id="expense-payment" className="w-full">
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
            <div className="flex min-w-40 flex-1 flex-col gap-1.5">
              <Label htmlFor="expense-description">Description</Label>
              <Input
                id="expense-description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="e.g. Dinner with friends"
              />
            </div>
            <Button onClick={handleAdd} disabled={submitting}>
              <Plus aria-hidden="true" />
              {submitting ? "Adding..." : "Add expense"}
            </Button>
          </div>

          {(formErrors.amount || formErrors.category || formErrors.date) && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-critical-surface px-3 py-2 text-sm text-critical"
            >
              {formErrors.amount ?? formErrors.category ?? formErrors.date}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex w-40 flex-col gap-1.5">
              <Label htmlFor="filter-category">Category</Label>
              <Select
                value={filterCategory || "all"}
                onValueChange={(value) =>
                  setFilterCategory(!value || value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="filter-category" className="w-full">
                  <SelectValue>
                    {(value) =>
                      !value || value === "all"
                        ? "All categories"
                        : String(value)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-36 flex-col gap-1.5">
              <Label htmlFor="filter-from">From</Label>
              <Input
                id="filter-from"
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
              />
            </div>
            <div className="flex w-36 flex-col gap-1.5">
              <Label htmlFor="filter-to">To</Label>
              <Input
                id="filter-to"
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
              />
            </div>
            <div className="flex min-w-40 flex-1 flex-col gap-1.5">
              <Label htmlFor="filter-search">Search description</Label>
              <Input
                id="filter-search"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
                placeholder="e.g. groceries"
              />
            </div>
            <Button type="button" variant="outline" onClick={applyFilters}>
              Apply
            </Button>
            <Button type="button" variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {actionError && (
        <p
          role="alert"
          className="rounded-lg bg-critical-surface px-3 py-2 text-sm text-critical"
        >
          {actionError}
        </p>
      )}

      {expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={hasFilters ? "No matching expenses" : "No expenses yet"}
          description={
            hasFilters
              ? "Nothing matches these filters. Try widening the date range or clearing them."
              : "Add your first expense above and it will show up here, ready to filter and edit."
          }
          action={
            hasFilters ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="gap-0 py-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                  <th className="px-4 py-2.5 font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Payment</th>
                  <th className="px-4 py-2.5 font-medium">Description</th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((expense) => {
                  const isEditing = editingId === expense.id && editForm;
                  return (
                    <tr
                      key={expense.id}
                      className="align-middle transition-colors hover:bg-muted/40"
                    >
                      {isEditing ? (
                        <>
                          <td className="px-4 py-2.5">
                            <Input
                              type="date"
                              className="w-36"
                              value={editForm!.date}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm!,
                                  date: e.target.value,
                                })
                              }
                              aria-label="Expense date"
                            />
                            {editErrors.date && (
                              <p className="mt-1 text-xs text-critical">
                                {editErrors.date}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <Select
                              value={editForm!.category}
                              onValueChange={(value) =>
                                setEditForm({
                                  ...editForm!,
                                  category: value ?? "",
                                })
                              }
                            >
                              <SelectTrigger
                                className="w-36"
                                aria-label="Category"
                              >
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
                          </td>
                          <td className="px-4 py-2.5">
                            <MoneyInput
                              className="w-28"
                              currency={currency}
                              value={editForm!.amount}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm!,
                                  amount: e.target.value,
                                })
                              }
                              aria-label="Amount"
                            />
                            {editErrors.amount && (
                              <p className="mt-1 text-xs text-critical">
                                {editErrors.amount}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <Select
                              value={editForm!.paymentMethod}
                              onValueChange={(value) =>
                                setEditForm({
                                  ...editForm!,
                                  paymentMethod: value ?? PAYMENT_METHODS[0],
                                })
                              }
                            >
                              <SelectTrigger
                                className="w-36"
                                aria-label="Payment method"
                              >
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
                          </td>
                          <td className="px-4 py-2.5">
                            <Input
                              value={editForm!.description}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm!,
                                  description: e.target.value,
                                })
                              }
                              aria-label="Description"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSaveEdit(expense.id)}
                                disabled={busyId === expense.id}
                              >
                                Save
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                            {expense.expenseDate}
                          </td>
                          <td className="px-4 py-2.5 font-medium">
                            {expense.category}
                          </td>
                          <td className="px-4 py-2.5 tabular-nums">
                            {formatCurrency(expense.amount, currency)}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {expense.paymentMethod}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {expense.description}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(expense)}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(expense.id)}
                                disabled={busyId === expense.id}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
              <span className="hidden sm:inline"> · {total} expenses</span>
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
