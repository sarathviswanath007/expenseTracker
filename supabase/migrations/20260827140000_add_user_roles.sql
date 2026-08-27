-- Roles for the Users admin page. Replaces the Settings placeholder.
--
-- Three pieces are needed and none of them is optional:
--   1. the role column itself
--   2. policies letting an admin read and update every profile
--   3. a guard stopping a non-admin from promoting themselves — the existing
--      "Users can update their own row" policy would otherwise allow exactly
--      that, since RLS grants access per row, not per column.

alter table public.users
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin'));

-- security definer, so the policies below can read the role without
-- re-entering the very policies being evaluated (infinite recursion).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Admins can view every user"
  on public.users for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update any user"
  on public.users for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Column-level guard: RLS can't express "you may edit your row but not this
-- column", so the rule lives in a trigger instead.
create or replace function public.guard_role_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() is null for service_role connections: the dashboard, and
  -- anything running server-side without an end-user session. Those already
  -- bypass RLS entirely, so gating them here adds no protection — and it
  -- would make the first admin impossible to create.
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only an admin can change a role';
  end if;
  return new;
end;
$$;

drop trigger if exists users_guard_role_changes on public.users;

create trigger users_guard_role_changes
  before update on public.users
  for each row execute function public.guard_role_changes();

-- Bootstrap: promote the first account to admin. Applied by hand for the
-- existing project; kept here so a fresh database ends up in the same state.
update public.users
set role = 'admin'
where id = (select id from public.users order by created_at asc limit 1);
