import { cn } from "@/lib/utils";

/**
 * The BudgetWise AI mark: a rising bar chart whose tallest bar doubles as the
 * stroke of a "B", with a spark denoting the AI layer. Uses currentColor so it
 * inherits whatever it sits on.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      <rect x="3" y="14" width="3.6" height="7" rx="1.2" fill="currentColor" opacity="0.45" />
      <rect x="8.7" y="10" width="3.6" height="11" rx="1.2" fill="currentColor" opacity="0.7" />
      <rect x="14.4" y="5" width="3.6" height="16" rx="1.2" fill="currentColor" />
      <path
        d="M20.4 3.1l.62 1.63 1.63.62-1.63.62-.62 1.63-.62-1.63L18.15 5.35l1.63-.62.62-1.63z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <LogoMark className="size-5" />
      </span>
      {showWordmark && (
        <span className="truncate text-sm font-semibold tracking-tight">
          BudgetWise <span className="text-primary-accent">AI</span>
        </span>
      )}
    </span>
  );
}
