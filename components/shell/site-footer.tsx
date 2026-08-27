"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const OWNER = "Sarath Viswanath";

/**
 * The site-wide copyright line. The year is read on the client so it stays
 * correct on statically prerendered pages, which would otherwise keep
 * whatever year they were built in.
 */
export function SiteFooter({
  note,
  className,
}: {
  /** Optional line shown alongside the copyright, e.g. the product tagline. */
  note?: string;
  className?: string;
}) {
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    // Prerendered pages ship the year they were built in, so the year is
    // re-read after mount; the resulting extra render is expected here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className={cn("border-t border-border", className)}>
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-5 text-sm text-muted-foreground sm:px-6">
        <p suppressHydrationWarning>
          © {year} {OWNER}. All rights reserved.
        </p>
        {note && <p>{note}</p>}
      </div>
    </footer>
  );
}
