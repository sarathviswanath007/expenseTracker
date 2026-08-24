-- Expenses table for Phase 3 (Section 6 / Section 14 of the PRD).

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  category text not null,
  amount numeric(12, 2) not null check (amount > 0),
  description text,
  expense_date date not null default current_date,
  payment_method text not null check (
    payment_method in (
      'Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Wallet'
    )
  ),
  created_at timestamptz not null default now()
);

create index if not exists expenses_user_id_date_idx
  on public.expenses (user_id, expense_date desc);

alter table public.expenses enable row level security;

create policy "Users manage their own expenses"
  on public.expenses for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
