"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Plus, Target, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { PageContainer } from "@/components/shell/page-container";
import { formatCurrency } from "@/lib/format-currency";
import { describeMonths, goalProgress } from "@/lib/goal-math";
import { cn } from "@/lib/utils";
import {
  createGoal,
  deleteGoal,
  setGoalStatus,
  updateGoal,
  type GoalRecord,
  type GoalsResult,
} from "@/services/goal.service";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function GoalsView({ result }: { result: GoalsResult | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [contribution, setContribution] = useState<Record<string, string>>({});

  if (!result) {
    return (
      <PageContainer width="narrow">
        <p className="text-muted-foreground">Log in to view your goals.</p>
      </PageContainer>
    );
  }

  const { goals, currency, monthlyRate, monthsOfHistory } = result;
  const active = goals.filter((goal) => goal.status === "active");
  const achieved = goals.filter((goal) => goal.status === "achieved");

  async function handleCreate() {
    setError(null);
    const target = Number(targetAmount);
    if (!name.trim()) {
      setError("Give the goal a name.");
      return;
    }
    if (!Number.isFinite(target) || target <= 0) {
      setError("Set a target amount greater than 0.");
      return;
    }

    setAdding(true);
    try {
      await createGoal({
        name: name.trim(),
        targetAmount: target,
        currentAmount: Number(currentAmount) || 0,
        targetDate: targetDate || null,
      });
      toast(`${name.trim()} added.`);
      setName("");
      setTargetAmount("");
      setCurrentAmount("");
      setTargetDate("");
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add the goal.");
    } finally {
      setAdding(false);
    }
  }

  async function handleContribute(goal: GoalRecord) {
    const amount = Number(contribution[goal.id]);
    if (!Number.isFinite(amount) || amount === 0) return;

    setBusyId(goal.id);
    setError(null);
    try {
      const next = Math.max(0, goal.currentAmount + amount);
      await updateGoal(goal.id, { currentAmount: next });
      setContribution((prev) => ({ ...prev, [goal.id]: "" }));
      toast(`${formatCurrency(amount, currency)} added to ${goal.name}.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleStatus(goal: GoalRecord, status: GoalRecord["status"]) {
    setBusyId(goal.id);
    setError(null);
    try {
      await setGoalStatus(goal.id, status);
      toast(
        status === "achieved"
          ? `${goal.name} marked as reached.`
          : `${goal.name} reopened.`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(goal: GoalRecord) {
    setBusyId(goal.id);
    setError(null);
    try {
      await deleteGoal(goal.id);
      toast(`${goal.name} deleted.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setBusyId(null);
    }
  }

  function renderGoal(goal: GoalRecord) {
    const progress = goalProgress(goal, monthlyRate);
    const done = goal.status === "achieved" || progress.remaining === 0;

    return (
      <li
        key={goal.id}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-medium">{goal.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(goal.currentAmount, currency)} of{" "}
              {formatCurrency(goal.targetAmount, currency)}
              {goal.targetDate && <> · by {formatDate(goal.targetDate)}</>}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              done
                ? "bg-positive-surface text-positive"
                : progress.pace === "behind"
                  ? "bg-critical-surface text-critical"
                  : "bg-primary/10 text-primary-accent",
            )}
          >
            {done
              ? "Reached"
              : progress.pace === "behind"
                ? "Behind target date"
                : `${Math.round(progress.percent)}%`}
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              done ? "bg-positive" : "bg-primary",
            )}
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        {!done && (
          <p className="text-sm text-muted-foreground">
            {formatCurrency(progress.remaining, currency)} to go.{" "}
            {progress.monthsToTarget === null ? (
              <>
                No completion estimate yet — it needs a month where you saved
                something.
              </>
            ) : (
              <>
                At {formatCurrency(monthlyRate, currency)} a month you&apos;ll
                get there in {describeMonths(progress.monthsToTarget)}, around{" "}
                {formatDate(progress.projectedDate!)}.
              </>
            )}
          </p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border pt-3">
          {!done ? (
            <div className="flex items-end gap-2">
              <div className="flex w-36 flex-col gap-1.5">
                <Label htmlFor={`contribute-${goal.id}`} className="text-xs">
                  Add to this goal
                </Label>
                <MoneyInput
                  id={`contribute-${goal.id}`}
                  currency={currency}
                  value={contribution[goal.id] ?? ""}
                  onChange={(e) =>
                    setContribution((prev) => ({
                      ...prev,
                      [goal.id]: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleContribute(goal)}
                disabled={busyId === goal.id}
              >
                Add
              </Button>
            </div>
          ) : (
            <span className="text-sm text-positive">
              Funded in full — nice work.
            </span>
          )}

          <div className="flex items-center gap-1">
            {goal.status === "active" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleStatus(goal, "achieved")}
                disabled={busyId === goal.id}
              >
                <Check aria-hidden="true" />
                Mark reached
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleStatus(goal, "active")}
                disabled={busyId === goal.id}
              >
                <Undo2 aria-hidden="true" />
                Reopen
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => handleDelete(goal)}
              disabled={busyId === goal.id}
            >
              <Trash2 aria-hidden="true" />
              <span className="sr-only">Delete {goal.name}</span>
            </Button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <PageContainer width="narrow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {monthlyRate > 0 ? (
            <>
              Projections use your own savings:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(monthlyRate, currency)}
              </span>{" "}
              a month, averaged over {monthsOfHistory}{" "}
              {monthsOfHistory === 1 ? "month" : "months"}.
            </>
          ) : (
            <>
              No savings recorded yet, so goals show progress but no estimate.
            </>
          )}
        </p>
        {goals.length > 0 && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus aria-hidden="true" />
            New goal
          </Button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-critical-surface px-3 py-2 text-sm text-critical"
        >
          {error}
        </p>
      )}

      {showForm && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <h2 className="font-medium">New goal</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex min-w-40 flex-1 flex-col gap-1.5">
              <Label htmlFor="goal-name">What are you saving for?</Label>
              <Input
                id="goal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Emergency fund"
              />
            </div>
            <div className="flex w-32 flex-col gap-1.5">
              <Label htmlFor="goal-target">Target</Label>
              <MoneyInput
                id="goal-target"
                currency={currency}
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex w-32 flex-col gap-1.5">
              <Label htmlFor="goal-saved">Saved so far</Label>
              <MoneyInput
                id="goal-saved"
                currency={currency}
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
            <div className="flex w-44 flex-col gap-1.5">
              <Label htmlFor="goal-date">Target date (optional)</Label>
              <Input
                id="goal-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <div className="flex flex-1 justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={adding}>
                {adding ? "Adding..." : "Add goal"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {goals.length === 0 && !showForm ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set what you're saving toward and this page tracks how far along you are — and when you'll get there at your current savings rate."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus aria-hidden="true" />
              Add your first goal
            </Button>
          }
        />
      ) : (
        <>
          {active.length > 0 && (
            <ul className="flex flex-col gap-3">{active.map(renderGoal)}</ul>
          )}

          {achieved.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Reached
              </h2>
              <ul className="flex flex-col gap-3">
                {achieved.map(renderGoal)}
              </ul>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Contributions are recorded here, not deducted from your expenses. To
        track money actually moved, log it on{" "}
        <Link href="/expenses" className="underline underline-offset-2">
          Expenses
        </Link>{" "}
        as well.
      </p>
    </PageContainer>
  );
}
