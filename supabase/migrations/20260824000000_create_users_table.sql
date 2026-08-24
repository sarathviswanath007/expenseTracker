-- Public profile table for authenticated users, extending Supabase's auth.users.
-- Section 14 of BudgetWise-AI-PRD.md.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text not null,
  currency text not null default 'USD' check (currency in ('INR', 'GBP', 'USD')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view their own row"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own row"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own row"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

-- Keep public.users in sync with auth.users: create the profile row as soon
-- as someone signs up (name comes from the `full_name` metadata set at signup).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
