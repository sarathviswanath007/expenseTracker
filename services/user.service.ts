"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

export type UserRole = "user" | "admin";

export interface ManagedUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
  /** True for the row belonging to whoever is viewing the page. */
  isSelf: boolean;
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  return { supabase, user };
}

/**
 * The viewer's own role. Used to decide whether the Users tab exists at all —
 * the database is still the thing enforcing access.
 */
export async function getCurrentRole(): Promise<UserRole | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);

  return (data?.role as UserRole | undefined) ?? "user";
}

/**
 * Every profile, newest first. Returns null for a non-admin rather than an
 * empty list, so the page can tell "not allowed" from "nobody signed up".
 * RLS returns only the caller's own row to a non-admin regardless.
 */
export async function listUsers(): Promise<ManagedUser[] | null> {
  const { supabase, user } = await requireUser();

  const role = await getCurrentRole();
  if (role !== "admin") return null;

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    createdAt: row.created_at,
    isSelf: row.id === user.id,
  }));
}

export async function setUserRole(id: string, role: UserRole) {
  const { supabase, user } = await requireUser();

  const callerRole = await getCurrentRole();
  if (callerRole !== "admin") {
    throw new Error("Only an admin can change a role.");
  }

  // Losing your own admin rights mid-session is a lockout risk with no
  // in-app way back, so it has to be another admin who does it.
  if (id === user.id && role !== "admin") {
    throw new Error(
      "You can't remove your own admin access. Ask another admin to do it.",
    );
  }

  const { error } = await supabase.from("users").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/users");
}
