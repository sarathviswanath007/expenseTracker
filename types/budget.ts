export type Currency = "INR" | "GBP" | "USD";

export interface IncomeEntry {
  id: string;
  userId: string;
  amount: number;
  source: string;
  incomeDate: string;
  isRecurring: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: number;
  year: number;
  currency: Currency;
  totalBudget: number;
  savingsTarget: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  budgetId: string;
  category: string;
  allocatedAmount: number;
  alertThresholdPercent: number;
  createdAt: string;
}
