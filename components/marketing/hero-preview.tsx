import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";

const CATEGORIES = [
  { name: "Rent", share: 40, color: "var(--chart-1)" },
  { name: "Food", share: 20, color: "var(--chart-2)" },
  { name: "Shopping", share: 15, color: "var(--chart-3)" },
  { name: "Transport", share: 10, color: "var(--chart-4)" },
];

const BARS = [38, 52, 34, 70, 60, 92];

/**
 * A static illustration of the product for the marketing hero. The figures are
 * an illustrative sample, labelled as such, not a real account's data.
 */
export function HeroPreview() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
      role="img"
      aria-label="Sample BudgetWise AI dashboard showing monthly spending of 62,500 against a 68,000 budget, a six-month spending trend, a category breakdown, and an AI insight about shopping being up 58 percent."
    >
      <div aria-hidden="true" className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Income", value: "₹90,000", tone: "text-foreground" },
            { label: "Spent", value: "₹62,500", tone: "text-foreground" },
            { label: "Saved", value: "₹27,500", tone: "text-positive" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-background p-2.5"
            >
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              <p className={`text-sm font-semibold ${stat.tone}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-background p-3">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-xs font-medium">Budget used</p>
            <p className="text-xs text-muted-foreground">92%</p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[92%] rounded-full bg-attention" />
          </div>
          <div className="mt-3 flex h-16 items-end gap-1.5">
            {BARS.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${h}%`,
                  backgroundColor:
                    i === BARS.length - 1 ? "var(--chart-1)" : "var(--muted)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-3">
          <p className="mb-2 text-xs font-medium">Where it went</p>
          <div className="flex flex-col gap-1.5">
            {CATEGORIES.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="w-16 shrink-0 text-[11px]">{c.name}</span>
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${c.share * 2.2}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </span>
                <span className="w-7 shrink-0 text-right text-[11px] text-muted-foreground">
                  {c.share}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/[0.06] p-3">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] leading-snug">
              <span className="font-medium">Shopping</span> is up{" "}
              <span className="font-medium text-critical">58%</span> vs last
              month.
            </p>
            <div className="flex gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border">
                <ArrowUpRight className="size-2.5" /> Review
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border">
                <ArrowDownRight className="size-2.5" /> Reset budget
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Illustrative sample data
      </p>
    </div>
  );
}
