import type { AlertStatus } from "@/lib/budget-alerts";
import type { CategoryTotal } from "@/lib/dashboard-math";
import type { Currency } from "@/types/budget";
import type { Expense } from "@/types/expense";

export interface CategoryAlert extends CategoryTotal {
  allocatedAmount: number;
  status: AlertStatus;
}

export interface DashboardSummary {
  currency: Currency;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  totalBudget: number;
  remainingBudget: number;
  utilizationPercent: number;
  topCategory: CategoryTotal | null;
  categoryTotals: CategoryTotal[];
  alerts: CategoryAlert[];
  recentTransactions: Expense[];
}

export interface MonthPoint {
  month: number;
  year: number;
  label: string;
}

export interface SpendingTrendPoint extends MonthPoint {
  total: number;
}

export interface IncomeVsExpensePoint extends MonthPoint {
  income: number;
  expense: number;
}

export interface SavingsTrendPoint extends MonthPoint {
  savings: number;
}

export interface BudgetVsActualPoint {
  category: string;
  planned: number;
  actual: number;
}
