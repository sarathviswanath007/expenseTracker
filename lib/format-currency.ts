import type { Currency } from "@/types/budget";

const LOCALES: Record<Currency, string> = {
  INR: "en-IN",
  GBP: "en-GB",
  USD: "en-US",
};

export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(LOCALES[currency], {
    style: "currency",
    currency,
  }).format(amount);
}

/** Whole-unit currency for chart axis ticks — no cents, so ticks stay clean. */
export function formatAxisCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(LOCALES[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
