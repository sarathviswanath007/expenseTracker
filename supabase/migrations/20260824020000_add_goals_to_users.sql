-- Financial goals selected during onboarding step 3 (Section 4 of the PRD).
-- Stored as a simple tag list on the profile rather than a dedicated table,
-- since Section 14 doesn't define a goals table for this Phase 2 selection
-- (distinct from the Financial Goals feature on the Goals page).

alter table public.users
  add column if not exists goals text[] not null default '{}';
