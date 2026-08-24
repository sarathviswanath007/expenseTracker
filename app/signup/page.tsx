"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase-browser";
import { getPasswordError, isValidEmail } from "@/lib/auth/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    const passwordError = getPasswordError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthLayout
        title="Check your email"
        description={`We sent a confirmation link to ${email}.`}
        footer={
          <Link
            href="/login"
            className="font-medium text-primary-accent hover:underline"
          >
            Back to login
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary-accent">
            <MailCheck className="size-5" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted-foreground">
            Click the link to activate your account, then come back and log in.
            If it hasn&apos;t arrived in a minute, check your spam folder.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Start tracking smarter with BudgetWise AI."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-accent hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            className="h-10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Your name"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="h-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            className="h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <p className="text-xs text-muted-foreground">
            At least 8 characters.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            className="h-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-critical-surface px-3 py-2 text-sm text-critical"
          >
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
