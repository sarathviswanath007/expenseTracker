"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { PageContainer } from "@/components/shell/page-container";
import { cn } from "@/lib/utils";
import { setUserRole, type ManagedUser } from "@/services/user.service";

function formatJoined(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UsersView({ users }: { users: ManagedUser[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const admins = users.filter((user) => user.role === "admin").length;

  async function handleRole(user: ManagedUser, role: ManagedUser["role"]) {
    setBusyId(user.id);
    setError(null);
    try {
      await setUserRole(user.id, role);
      toast(
        role === "admin"
          ? `${user.email} is now an admin.`
          : `${user.email} is no longer an admin.`,
      );
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change the role.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {users.length} {users.length === 1 ? "person" : "people"} signed up ·{" "}
          {admins} {admins === 1 ? "admin" : "admins"}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-critical-surface px-3 py-2 text-sm text-critical"
        >
          {error}
        </p>
      )}

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No accounts yet"
          description="Everyone who signs up appears here, with the date they joined."
        />
      ) : (
        <Card className="gap-0 py-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 text-right font-medium">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="align-middle transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-2.5 font-medium">
                      {user.name ?? "—"}
                      {user.isSelf && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          you
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                      {formatJoined(user.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          user.role === "admin"
                            ? "bg-primary/10 text-primary-accent"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {user.role === "admin" ? "Admin" : "Member"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end">
                        {user.role === "admin" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={user.isSelf || busyId === user.id}
                            title={
                              user.isSelf
                                ? "Another admin has to remove your access"
                                : undefined
                            }
                            onClick={() => handleRole(user, "user")}
                          >
                            <ShieldOff aria-hidden="true" />
                            Remove admin
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyId === user.id}
                            onClick={() => handleRole(user, "admin")}
                          >
                            <ShieldCheck aria-hidden="true" />
                            Make admin
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Admins can see this page and change roles. They cannot see anyone
        else&apos;s budgets, expenses, or income — those stay locked to their
        owner by row-level security in the database.
      </p>
    </PageContainer>
  );
}
