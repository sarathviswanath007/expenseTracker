export const DEFAULT_CATEGORIES = [
  "Rent",
  "Food",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Investments",
  "Savings",
];

export const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Wallet",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
