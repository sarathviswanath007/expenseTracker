import Link from "next/link";
import type { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";
import { LogoutButton } from "@/components/logout-button";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard" className="text-lg font-semibold">
              BudgetWise AI
            </Link>
            <AppNav />
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
