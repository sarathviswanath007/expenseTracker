"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase-browser";
import { isValidEmail } from "@/lib/auth/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
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

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      },
    );
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthLayout
        title="Check your email"
        description={`If an account exists for ${email}, we sent a reset link.`}
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
            Follow the link to choose a new password. If it hasn&apos;t arrived
            in a minute, check your spam folder.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and we'll send you a reset link."
      footer={
        <Link
          href="/login"
          className="font-medium text-primary-accent hover:underline"
        >
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-critical-surface px-3 py-2 text-sm text-critical"
          >
            {error}
          </p>
        )}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
