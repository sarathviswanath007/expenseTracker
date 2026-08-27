import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one page frame every in-app route uses, so gutters, max width, and the
 * gap between sections stay identical from Dashboard through Settings.
 */
export function PageContainer({
  children,
  width = "wide",
  className,
}: {
  children: ReactNode;
  width?: "wide" | "narrow";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col gap-5 p-4 sm:p-6",
        width === "wide" ? "max-w-6xl" : "max-w-3xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
