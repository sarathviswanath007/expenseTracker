export interface GoalProgress {
  /** 0–100, capped so an overfunded goal doesn't overflow its bar. */
  percent: number;
  remaining: number;
  /** Whole months at the given rate, or null when the rate can't fund it. */
  monthsToTarget: number | null;
  /** ISO date the goal is reached at that rate, or null. */
  projectedDate: string | null;
  /** Against target_date: ahead, behind, or no date set. */
  pace: "no-target-date" | "ahead" | "behind" | "unknown";
}

/** A rate below this is treated as no progress at all. */
const MIN_MONTHLY_RATE = 1;
/** Refuse to project further out than this — the estimate stops meaning much. */
const MAX_MONTHS = 600;

export function addMonths(from: Date, months: number): Date {
  const date = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  const target = new Date(date);
  target.setUTCMonth(target.getUTCMonth() + months);
  return target;
}

/**
 * Progress toward one goal, plus when it lands if the user keeps saving at
 * `monthlyRate`. The rate is their own recent savings, not a guess: an
 * estimate the user can't trace back to their numbers is worse than none.
 */
export function goalProgress(
  goal: {
    targetAmount: number;
    currentAmount: number;
    targetDate?: string | null;
  },
  monthlyRate: number,
  today: Date = new Date(),
): GoalProgress {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const percent =
    goal.targetAmount > 0
      ? Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100))
      : 0;

  if (remaining === 0) {
    return {
      percent: 100,
      remaining: 0,
      monthsToTarget: 0,
      projectedDate: today.toISOString().slice(0, 10),
      pace: goal.targetDate ? "ahead" : "no-target-date",
    };
  }

  if (monthlyRate < MIN_MONTHLY_RATE) {
    return {
      percent,
      remaining,
      monthsToTarget: null,
      projectedDate: null,
      pace: goal.targetDate ? "unknown" : "no-target-date",
    };
  }

  const months = Math.ceil(remaining / monthlyRate);
  if (months > MAX_MONTHS) {
    return {
      percent,
      remaining,
      monthsToTarget: null,
      projectedDate: null,
      pace: goal.targetDate ? "behind" : "no-target-date",
    };
  }

  const projected = addMonths(today, months);
  const projectedDate = projected.toISOString().slice(0, 10);

  if (!goal.targetDate) {
    return {
      percent,
      remaining,
      monthsToTarget: months,
      projectedDate,
      pace: "no-target-date",
    };
  }

  const target = new Date(`${goal.targetDate}T00:00:00.000Z`);
  return {
    percent,
    remaining,
    monthsToTarget: months,
    projectedDate,
    pace: projected.getTime() <= target.getTime() ? "ahead" : "behind",
  };
}

/**
 * The savings rate the projections run on: the average of the months given,
 * ignoring negative months so one overspend doesn't imply a goal is
 * unreachable forever.
 */
export function monthlySavingsRate(monthlySavings: number[]): number {
  const usable = monthlySavings.filter((value) => value > 0);
  if (usable.length === 0) return 0;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

export function describeMonths(months: number): string {
  if (months <= 0) return "now";
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const yearPart = years === 1 ? "1 year" : `${years} years`;
  if (rest === 0) return yearPart;
  return `${yearPart} ${rest === 1 ? "1 month" : `${rest} months`}`;
}
