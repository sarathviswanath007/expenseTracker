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
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/categories";
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
}: {
  categories: string[];
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <p className="text-muted-foreground text-sm">
          Log what you spend and keep it categorized.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <h2 className="font-medium">Add an expense</h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex w-28 flex-col gap-1.5">
            <Label>Amount</Label>
            <Input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            {formErrors.amount && (
              <p className="text-xs text-destructive">{formErrors.amount}</p>
            )}
          </div>
          <div className="flex w-40 flex-col gap-1.5">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) =>
                setForm({ ...form, category: value ?? "" })
              }
            >
              <SelectTrigger className="w-full">
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
            {formErrors.category && (
              <p className="text-xs text-destructive">{formErrors.category}</p>
            )}
          </div>
          <div className="flex w-40 flex-col gap-1.5">
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            {formErrors.date && (
              <p className="text-xs text-destructive">{formErrors.date}</p>
            )}
          </div>
          <div className="flex w-40 flex-col gap-1.5">
            <Label>Payment method</Label>
            <Select
              value={form.paymentMethod}
              onValueChange={(value) =>
                setForm({ ...form, paymentMethod: value ?? PAYMENT_METHODS[0] })
              }
            >
              <SelectTrigger className="w-full">
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
          <div className="flex flex-1 min-w-40 flex-col gap-1.5">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="e.g. Dinner with friends"
            />
          </div>
          <Button onClick={handleAdd} disabled={submitting}>
            {submitting ? "Adding..." : "Add expense"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex w-40 flex-col gap-1.5">
          <Label>Category</Label>
          <Select
            value={filterCategory || "all"}
            onValueChange={(value) =>
              setFilterCategory(!value || value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
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
          <Label>From</Label>
          <Input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
        </div>
        <div className="flex w-36 flex-col gap-1.5">
          <Label>To</Label>
          <Input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
        </div>
        <div className="flex flex-1 min-w-40 flex-col gap-1.5">
          <Label>Search description</Label>
          <Input
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters();
            }}
          />
        </div>
        <Button type="button" variant="outline" onClick={applyFilters}>
          Apply filters
        </Button>
        <Button type="button" variant="ghost" onClick={clearFilters}>
          Clear
        </Button>
      </div>

      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-2">Date</th>
              <th className="py-2 pr-2">Category</th>
              <th className="py-2 pr-2">Amount</th>
              <th className="py-2 pr-2">Payment</th>
              <th className="py-2 pr-2">Description</th>
              <th className="py-2 pr-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  No expenses found.
                </td>
              </tr>
            )}
            {expenses.map((expense) => {
              const isEditing = editingId === expense.id && editForm;
              return (
                <tr key={expense.id} className="border-b align-top">
                  {isEditing ? (
                    <>
                      <td className="py-2 pr-2">
                        <Input
                          type="date"
                          className="w-36"
                          value={editForm!.date}
                          onChange={(e) =>
                            setEditForm({ ...editForm!, date: e.target.value })
                          }
                        />
                        {editErrors.date && (
                          <p className="text-xs text-destructive">
                            {editErrors.date}
                          </p>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        <Select
                          value={editForm!.category}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm!, category: value ?? "" })
                          }
                        >
                          <SelectTrigger className="w-36">
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
                      <td className="py-2 pr-2">
                        <Input
                          type="number"
                          min="0"
                          className="w-24"
                          value={editForm!.amount}
                          onChange={(e) =>
                            setEditForm({ ...editForm!, amount: e.target.value })
                          }
                        />
                        {editErrors.amount && (
                          <p className="text-xs text-destructive">
                            {editErrors.amount}
                          </p>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        <Select
                          value={editForm!.paymentMethod}
                          onValueChange={(value) =>
                            setEditForm({
                              ...editForm!,
                              paymentMethod: value ?? PAYMENT_METHODS[0],
                            })
                          }
                        >
                          <SelectTrigger className="w-36">
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
                      <td className="py-2 pr-2">
                        <Input
                          value={editForm!.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm!,
                              description: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="flex gap-2 py-2 pr-2">
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
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 pr-2 whitespace-nowrap">
                        {expense.expenseDate}
                      </td>
                      <td className="py-2 pr-2">{expense.category}</td>
                      <td className="py-2 pr-2">{expense.amount}</td>
                      <td className="py-2 pr-2">{expense.paymentMethod}</td>
                      <td className="py-2 pr-2">{expense.description}</td>
                      <td className="py-2 pr-2">
                        <div className="flex gap-2">
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages} ({total} total)
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
    </div>
  );
}
