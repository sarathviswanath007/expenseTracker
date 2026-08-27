"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTH_NAMES } from "@/lib/dates";
import { cn } from "@/lib/utils";

/**
 * The month/year control shared by Dashboard, Budgets, and Analytics — one
 * shape everywhere so switching pages doesn't move the picker around.
 */
export function MonthYearPicker({
  month,
  year,
  onChange,
  className,
}: {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={String(month)}
        onValueChange={(value) => value && onChange(Number(value), year)}
      >
        <SelectTrigger size="sm" className="w-36" aria-label="Month">
          <SelectValue>{(value) => MONTH_NAMES[Number(value) - 1]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MONTH_NAMES.map((name, index) => (
            <SelectItem key={name} value={String(index + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(year)}
        onValueChange={(value) => value && onChange(month, Number(value))}
      >
        <SelectTrigger size="sm" className="w-24" aria-label="Year">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[year - 1, year, year + 1].map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Left-hand context line plus right-hand controls, above a page's content. */
export function PageToolbar({
  context,
  children,
}: {
  context: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{context}</p>
      {children}
    </div>
  );
}
