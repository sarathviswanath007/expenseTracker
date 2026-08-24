import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/categories";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getExpenseAmountError(amount: string): string | null {
  if (!amount.trim()) {
    return "Enter an amount.";
  }
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return "Amount must be a number greater than 0.";
  }
  return null;
}

export function getExpenseCategoryError(category: string): string | null {
  if (!category.trim()) {
    return "Select a category.";
  }
  return null;
}

export function getExpenseDateError(date: string): string | null {
  if (!date.trim()) {
    return "Select a date.";
  }
  if (!DATE_PATTERN.test(date) || Number.isNaN(new Date(date).getTime())) {
    return "Enter a valid date.";
  }
  return null;
}

export function getExpensePaymentMethodError(
  paymentMethod: string,
): string | null {
  if (!PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
    return "Select a payment method.";
  }
  return null;
}

export interface ExpenseFormValues {
  amount: string;
  category: string;
  date: string;
  paymentMethod: string;
}

export function getExpenseFormErrors(
  values: ExpenseFormValues,
): Partial<Record<keyof ExpenseFormValues, string>> {
  const errors: Partial<Record<keyof ExpenseFormValues, string>> = {};

  const amountError = getExpenseAmountError(values.amount);
  if (amountError) errors.amount = amountError;

  const categoryError = getExpenseCategoryError(values.category);
  if (categoryError) errors.category = categoryError;

  const dateError = getExpenseDateError(values.date);
  if (dateError) errors.date = dateError;

  const paymentMethodError = getExpensePaymentMethodError(values.paymentMethod);
  if (paymentMethodError) errors.paymentMethod = paymentMethodError;

  return errors;
}
