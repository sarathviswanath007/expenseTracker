import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { getCurrentRole } from "@/services/user.service";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const role = await getCurrentRole();

  return <AppShell isAdmin={role === "admin"}>{children}</AppShell>;
}
