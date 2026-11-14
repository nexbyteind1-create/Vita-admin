-- Membership plan catalog + plan-wise doctor member pricing.
-- Run once in Supabase SQL editor after home_screen.sql and admin.sql.
-- Links user memberships to plans and stores per-plan doctor fee overrides.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Plans
-- ---------------------------------------------------------------------------
create table if not exists public.membership_plans (
  id uuid not null default gen_random_uuid(),
  slug text not null,
  name text not null,
  tier text not null default 'custom',
  price numeric(12, 2) not null,
  validity_days integer not null default 365,
  max_family_members integer not null default 2,
  status text not null default 'active',
  current_version integer not null default 1,
  doctor_fee_mode text not null default 'percent',
  doctor_member_fee_default numeric(12, 2) null,
  doctor_fee_percent numeric(5, 2) null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint membership_plans_pkey primary key (id),
  constraint membership_plans_slug_key unique (slug),
  constraint membership_plans_tier_check check (tier in ('silver', 'gold', 'platinum', 'custom')),
  constraint membership_plans_status_check check (status in ('active', 'inactive', 'archived')),
  constraint membership_plans_doctor_fee_mode_check check (
    doctor_fee_mode in ('fixed_default', 'percent', 'doctor_default')
  )
);

drop trigger if exists membership_plans_set_updated_at on public.membership_plans;
create trigger membership_plans_set_updated_at
  before update on public.membership_plans
  for each row execute function public.set_updated_at();

create table if not exists public.membership_plan_features (
  id uuid not null default gen_random_uuid(),
  plan_id uuid not null references public.membership_plans (id) on delete cascade,
  feature_key text not null,
  name text not null,
  category text not null,
  enabled boolean not null default true,
  limit_count integer null,
  percentage numeric(5, 2) null,
  quantity integer null,
  validity_days integer null,
  sort_order integer not null default 0,
  constraint membership_plan_features_pkey primary key (id),
  constraint membership_plan_features_plan_feature_key unique (plan_id, feature_key)
);

create table if not exists public.membership_plan_versions (
  id uuid not null default gen_random_uuid(),
  plan_id uuid not null references public.membership_plans (id) on delete cascade,
  version integer not null,
  created_at timestamp with time zone not null default now(),
  created_by text null,
  changes text not null default '',
  snapshot jsonb not null default '{}',
  constraint membership_plan_versions_pkey primary key (id),
  constraint membership_plan_versions_plan_version unique (plan_id, version)
);

-- Per-plan doctor member fee (overrides plan default / percent mode for that doctor).
create table if not exists public.membership_plan_doctor_fees (
  plan_id uuid not null references public.membership_plans (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  member_fee numeric(12, 2) not null,
  updated_at timestamp with time zone not null default now(),
  constraint membership_plan_doctor_fees_pkey primary key (plan_id, doctor_id)
);

alter table public.memberships
  add column if not exists plan_id uuid null references public.membership_plans (id) on delete set null;

create index if not exists memberships_plan_id_idx on public.memberships (plan_id);

-- ---------------------------------------------------------------------------
-- RLS (admin console)
-- ---------------------------------------------------------------------------
alter table public.membership_plans enable row level security;
alter table public.membership_plan_features enable row level security;
alter table public.membership_plan_versions enable row level security;
alter table public.membership_plan_doctor_fees enable row level security;

drop policy if exists membership_plans_admin on public.membership_plans;
create policy membership_plans_admin on public.membership_plans
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists membership_plan_features_admin on public.membership_plan_features;
create policy membership_plan_features_admin on public.membership_plan_features
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists membership_plan_versions_admin on public.membership_plan_versions;
create policy membership_plan_versions_admin on public.membership_plan_versions
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists membership_plan_doctor_fees_admin on public.membership_plan_doctor_fees;
create policy membership_plan_doctor_fees_admin on public.membership_plan_doctor_fees
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Members may read active plans (pricing in app).
drop policy if exists membership_plans_public_read on public.membership_plans;
create policy membership_plans_public_read on public.membership_plans
  for select to authenticated
  using (status = 'active');

drop policy if exists membership_plan_features_public_read on public.membership_plan_features;
create policy membership_plan_features_public_read on public.membership_plan_features
  for select to authenticated
  using (
    exists (
      select 1 from public.membership_plans p
      where p.id = plan_id and p.status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- Seed Silver / Gold / Platinum (idempotent via slug)
-- ---------------------------------------------------------------------------
insert into public.membership_plans (
  slug, name, tier, price, validity_days, max_family_members, status, current_version,
  doctor_fee_mode, doctor_fee_percent
)
values
  ('plan-silver', 'Silver', 'silver', 999, 365, 2, 'active', 2, 'percent', 50),
  ('plan-gold', 'Gold', 'gold', 2499, 365, 4, 'active', 3, 'percent', 35),
  ('plan-platinum', 'Platinum', 'platinum', 4999, 365, 6, 'active', 1, 'percent', 20)
on conflict (slug) do nothing;

-- Features are seeded from the admin UI after migration if missing; optional bulk seed:
-- (Re-run safe: only inserts when no features exist for that plan.)

do $$
declare
  v_silver uuid;
  v_gold uuid;
  v_platinum uuid;
begin
  select id into v_silver from public.membership_plans where slug = 'plan-silver';
  select id into v_gold from public.membership_plans where slug = 'plan-gold';
  select id into v_platinum from public.membership_plans where slug = 'plan-platinum';

  if v_silver is not null and not exists (select 1 from public.membership_plan_features where plan_id = v_silver) then
    insert into public.membership_plan_features (plan_id, feature_key, name, category, enabled, quantity, validity_days, percentage, limit_count, sort_order)
    values
      (v_silver, 'f1', 'Free Doctor Appointments', 'Appointments', true, 4, 365, null, null, 1),
      (v_silver, 'f2', 'Follow-up Appointments', 'Appointments', true, 2, 365, null, null, 2),
      (v_silver, 'f3', 'Laboratory Discounts', 'Discounts', true, null, null, 10, null, 3),
      (v_silver, 'f4', 'Diagnostic Discounts', 'Discounts', true, null, null, 10, null, 4),
      (v_silver, 'f5', 'Pharmacy Discounts', 'Discounts', true, null, null, 5, null, 5),
      (v_silver, 'f10', 'AI Health Assistant', 'Digital', true, null, null, null, 10, 10);
  end if;

  if v_gold is not null and not exists (select 1 from public.membership_plan_features where plan_id = v_gold) then
    insert into public.membership_plan_features (plan_id, feature_key, name, category, enabled, quantity, validity_days, percentage, limit_count, sort_order)
    values
      (v_gold, 'f1', 'Free Doctor Appointments', 'Appointments', true, 8, 365, null, null, 1),
      (v_gold, 'f2', 'Follow-up Appointments', 'Appointments', true, 6, 365, null, null, 2),
      (v_gold, 'f3', 'Laboratory Discounts', 'Discounts', true, null, null, 20, null, 3),
      (v_gold, 'f4', 'Diagnostic Discounts', 'Discounts', true, null, null, 20, null, 4),
      (v_gold, 'f5', 'Pharmacy Discounts', 'Discounts', true, null, null, 15, null, 5),
      (v_gold, 'f10', 'AI Health Assistant', 'Digital', true, null, null, null, 30, 10);
  end if;

  if v_platinum is not null and not exists (select 1 from public.membership_plan_features where plan_id = v_platinum) then
    insert into public.membership_plan_features (plan_id, feature_key, name, category, enabled, quantity, validity_days, percentage, limit_count, sort_order)
    values
      (v_platinum, 'f1', 'Free Doctor Appointments', 'Appointments', true, 24, 365, null, null, 1),
      (v_platinum, 'f2', 'Follow-up Appointments', 'Appointments', true, 12, 365, null, null, 2),
      (v_platinum, 'f3', 'Laboratory Discounts', 'Discounts', true, null, null, 30, null, 3),
      (v_platinum, 'f4', 'Diagnostic Discounts', 'Discounts', true, null, null, 30, null, 4),
      (v_platinum, 'f5', 'Pharmacy Discounts', 'Discounts', true, null, null, 25, null, 5),
      (v_platinum, 'f10', 'AI Health Assistant', 'Digital', true, null, null, null, 999, 10);
  end if;
end $$;

-- Backfill plan_id on memberships from plan_name when possible.
update public.memberships m
set plan_id = p.id
from public.membership_plans p
where m.plan_id is null
  and lower(trim(m.plan_name)) = lower(p.name);

-- Resolve member consultation fee for a user + doctor (use in book_slot / app).
create or replace function public.resolve_doctor_member_fee(p_user_id uuid, p_doctor_id uuid)
returns numeric
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_mode text;
  v_default numeric;
  v_percent numeric;
  v_consult numeric;
  v_doc_member numeric;
  v_override numeric;
  v_active boolean;
begin
  select m.is_active, coalesce(m.plan_id, p.id)
  into v_active, v_plan_id
  from public.memberships m
  left join public.membership_plans p on lower(p.name) = lower(m.plan_name)
  where m.user_id = p_user_id;

  select consultation_fee, member_fee into v_consult, v_doc_member
  from public.doctors where id = p_doctor_id;

  if not coalesce(v_active, false) or v_plan_id is null then
    return v_consult;
  end if;

  select doctor_fee_mode, doctor_member_fee_default, doctor_fee_percent
  into v_mode, v_default, v_percent
  from public.membership_plans where id = v_plan_id;

  select member_fee into v_override
  from public.membership_plan_doctor_fees
  where plan_id = v_plan_id and doctor_id = p_doctor_id;

  if v_override is not null then return v_override; end if;
  if v_mode = 'fixed_default' and v_default is not null then return v_default; end if;
  if v_mode = 'percent' and v_consult is not null and v_percent is not null then
    return round(v_consult * (1 - v_percent / 100.0));
  end if;
  return coalesce(v_doc_member, v_consult);
end;
$$;

grant execute on function public.resolve_doctor_member_fee(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Delete a plan (manual / SQL editor)
-- ---------------------------------------------------------------------------
-- Prefer Super Admin → Membership → Plans → Delete (same rules).
-- Features, versions, and plan_doctor_fees are removed by ON DELETE CASCADE.
-- memberships.plan_id becomes NULL when the plan row is deleted.
--
--   delete from public.membership_plans where slug = 'plan-my-tier';
--
-- Reassign users first if any row still references the plan:
--
--   select user_id, plan_name, plan_id from public.memberships where plan_id = '<plan-uuid>';