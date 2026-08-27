export interface ExistingIncomeRow {
  id: string;
  source: string;
}

export interface IncomingIncomeRow {
  source: string;
  amount: number;
  isRecurring: boolean;
}

export interface IncomeUpdate extends IncomingIncomeRow {
  id: string;
}

export interface IncomeReconciliation {
  updates: IncomeUpdate[];
  inserts: IncomingIncomeRow[];
}

function key(source: string): string {
  return source.trim().toLowerCase();
}

/**
 * Works out how to write onboarding's income against what the account
 * already has. Re-running onboarding should restate a source, not add a
 * second copy of it — but income rows added by hand elsewhere are none of
 * onboarding's business, so anything it doesn't mention is left alone.
 *
 * Matching is on the trimmed, case-folded source name. Each existing row
 * can be claimed once, so two rows named "Salary" (the shape the old
 * append-only write produced) leave the surplus untouched rather than
 * being silently deleted.
 */
export function reconcileIncome(
  existing: ExistingIncomeRow[],
  incoming: IncomingIncomeRow[],
): IncomeReconciliation {
  // A later duplicate in the same submission is the user correcting
  // themselves, so it wins outright.
  const deduped = new Map<string, IncomingIncomeRow>();
  for (const row of incoming) {
    if (!row.source.trim()) continue;
    deduped.set(key(row.source), row);
  }

  const claimed = new Set<string>();
  const updates: IncomeUpdate[] = [];
  const inserts: IncomingIncomeRow[] = [];

  for (const row of deduped.values()) {
    const match = existing.find(
      (candidate) =>
        key(candidate.source) === key(row.source) && !claimed.has(candidate.id),
    );

    if (match) {
      claimed.add(match.id);
      updates.push({ ...row, id: match.id });
    } else {
      inserts.push(row);
    }
  }

  return { updates, inserts };
}
