-- Financial goals for the Goals page (Section 9 and Section 14 of
-- BudgetWise-AI-PRD.md). Distinct from users.goals, which holds the tag list
-- picked during onboarding; this table is the tracked, funded version.

create table if not exists public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  target_date date,
  status text not null default 'active'
    check (status in ('active', 'achieved', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists financial_goals_user_id_idx
  on public.financial_goals (user_id);

alter table public.financial_goals enable row level security;

create policy "Users manage their own financial goals"
  on public.financial_goals for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger financial_goals_set_updated_at
  before update on public.financial_goals
  for each row execute function public.set_updated_at();
