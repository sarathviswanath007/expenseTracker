import type { PaymentMethod } from "@/lib/categories";

export interface Expense {
  id: string;
  userId: string;
  category: string;
  amount: number;
  description: string | null;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}
