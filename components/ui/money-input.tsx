import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Currency } from "@/types/budget";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  GBP: "£",
  USD: "$",
};

/** Amount field with the currency symbol pinned inside it. */
export function MoneyInput({
  currency,
  className,
  ...props
}: ComponentProps<typeof Input> & { currency: Currency }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground">
        {CURRENCY_SYMBOLS[currency]}
      </span>
      <Input
        type="number"
        min="0"
        placeholder="0"
        className={cn("pl-6 tabular-nums", className)}
        {...props}
      />
    </div>
  );
}
