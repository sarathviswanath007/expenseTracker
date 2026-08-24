-- Income, budgets, and budget_categories tables for Phase 2 (Section 14 of
-- BudgetWise-AI-PRD.md, extended per Section 5's currency/savings/alert needs).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Income
create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  source text not null,
  income_date date not null default current_date,
  is_recurring boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists income_user_id_idx on public.income (user_id);

alter table public.income enable row level security;

create policy "Users manage their own income"
  on public.income for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Budgets
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  month smallint not null check (month between 1 and 12),
  year smallint not null check (year between 2000 and 2100),
  currency text not null default 'USD' check (currency in ('INR', 'GBP', 'USD')),
  total_budget numeric(12, 2) not null check (total_budget >= 0),
  savings_target numeric(12, 2) not null default 0 check (savings_target >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month, year)
);

create index if not exists budgets_user_id_idx on public.budgets (user_id);

alter table public.budgets enable row level security;

create policy "Users manage their own budgets"
  on public.budgets for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger budgets_set_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

-- Budget categories (category-wise allocations within a budget)
create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets (id) on delete cascade,
  category text not null,
  allocated_amount numeric(12, 2) not null check (allocated_amount >= 0),
  alert_threshold_percent smallint not null default 85
    check (alert_threshold_percent between 1 and 100),
  created_at timestamptz not null default now(),
  unique (budget_id, category)
);

create index if not exists budget_categories_budget_id_idx on public.budget_categories (budget_id);

alter table public.budget_categories enable row level security;

-- budget_categories has no user_id column, so policies check ownership
-- through the parent budget.
create policy "Users manage their own budget categories"
  on public.budget_categories for all
  to authenticated
  using (
    exists (
      select 1 from public.budgets b
      where b.id = budget_categories.budget_id
        and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.budgets b
      where b.id = budget_categories.budget_id
        and b.user_id = auth.uid()
    )
  );
