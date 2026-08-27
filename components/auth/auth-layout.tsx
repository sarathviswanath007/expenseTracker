import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { SiteFooter } from "@/components/shell/site-footer";

const POINTS = [
  "Track every expense by category and payment method",
  "Set per-category budgets with your own alert thresholds",
  "See what changed each month — and what to do next",
];

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      {/* Brand panel — decorative, hidden on small screens where the form leads. */}
      <div className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-black/10 blur-3xl"
        />

        <Link href="/" className="relative flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-white/15">
            <LogoMark className="size-5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            BudgetWise AI
          </span>
        </Link>

        <div className="relative flex flex-col gap-6">
          <h2 className="max-w-sm text-3xl font-semibold tracking-tight text-balance">
            Understand your money. Make smarter decisions.
          </h2>
          <ul className="flex flex-col gap-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                <span className="text-primary-foreground/90">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/70">
          Track smarter. Spend better. Save more.
        </p>
      </div>

      <div className="flex flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 sm:p-10">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>

          <div className="w-full max-w-sm">
            <div className="mb-6 flex flex-col gap-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
          </div>

          {footer && (
            <div className="w-full max-w-sm text-center text-sm text-muted-foreground">
              {footer}
            </div>
          )}
        </div>

        <SiteFooter className="border-t-0" />
      </div>
    </div>
  );
}
