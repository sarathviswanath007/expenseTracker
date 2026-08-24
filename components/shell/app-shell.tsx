"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/shell/sidebar";
import { findNavItem } from "@/components/shell/nav-items";
import { LogoutButton } from "@/components/logout-button";

const COLLAPSE_KEY = "budgetwise-sidebar-collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      // Read after mount so the server-rendered markup still matches on
      // hydration; the resulting extra render is expected here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "true");
    } catch {
      // Storage unavailable (private mode, blocked cookies) — keep expanded.
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, String(next));
      } catch {
        // Persisting the preference is best-effort.
      }
      return next;
    });
  }

  const current = findNavItem(pathname);

  return (
    <div className="flex min-h-full flex-1">
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 md:block",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="sticky top-0 h-dvh">
          <SidebarNav collapsed={collapsed} onToggle={toggleCollapsed} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-border bg-card shadow-xl">
            <div className="flex justify-end p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <SidebarNav
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Open navigation"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4.5" aria-hidden="true" />
            </Button>

            <div className="min-w-0 flex-1">
              {/* On desktop the sidebar already marks the current section, so
                  the page name would only repeat it — keep it for screen
                  readers and for mobile, where the sidebar is hidden. */}
              <h1 className="truncate text-base font-semibold md:sr-only">
                {current?.label ?? "BudgetWise AI"}
              </h1>
              {current?.subtitle && (
                <p className="hidden truncate text-sm text-muted-foreground md:block">
                  {current.subtitle}
                </p>
              )}
            </div>

            <Button render={<Link href="/expenses" />} size="sm">
              <Plus className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Add expense</span>
            </Button>
            <LogoutButton />
          </div>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
