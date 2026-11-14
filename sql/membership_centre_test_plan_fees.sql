-- Plan-wise lab & diagnostic pricing (run AFTER membership_plans.sql).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE.
--
-- Requires: membership_plans, test_centres, tests, centre_tests, memberships,
--           public.is_admin(), lab_diagnostics.sql (centre_tests table).

-- ---------------------------------------------------------------------------
-- Table: price per (membership plan, lab/centre, test)
-- ---------------------------------------------------------------------------
create table if not exists public.membership_plan_centre_test_fees (
  plan_id uuid not null references public.membership_plans (id) on delete cascade,
  centre_id uuid not null references public.test_centres (id) on delete cascade,
  test_id uuid not null references public.tests (id) on delete cascade,
  price integer not null check (price >= 0),
  updated_at timestamp with time zone not null default now(),
  constraint membership_plan_centre_test_fees_pkey primary key (plan_id, centre_id, test_id)
);

create index if not exists membership_plan_centre_test_fees_test_idx
  on public.membership_plan_centre_test_fees (test_id, centre_id);

-- ---------------------------------------------------------------------------
-- RLS (admin console — same as other membership tables)
-- ---------------------------------------------------------------------------
alter table public.membership_plan_centre_test_fees enable row level security;

drop policy if exists membership_plan_centre_test_fees_admin on public.membership_plan_centre_test_fees;
create policy membership_plan_centre_test_fees_admin on public.membership_plan_centre_test_fees
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Resolver for the Vita app at booking time
-- ---------------------------------------------------------------------------
create or replace function public.resolve_centre_test_price(p_user_id uuid, p_centre_id uuid, p_test_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_active boolean;
  v_standard integer;
  v_legacy integer;
  v_plan_price integer;
begin
  select price, member_price into v_standard, v_legacy
  from public.centre_tests
  where centre_id = p_centre_id and test_id = p_test_id;

  if v_standard is null then
    return null;
  end if;

  select m.is_active, coalesce(m.plan_id, p.id)
  into v_active, v_plan_id
  from public.memberships m
  left join public.membership_plans p on lower(p.name) = lower(m.plan_name)
  where m.user_id = p_user_id;

  if not coalesce(v_active, false) or v_plan_id is null then
    return v_standard;
  end if;

  select price into v_plan_price
  from public.membership_plan_centre_test_fees
  where plan_id = v_plan_id and centre_id = p_centre_id and test_id = p_test_id;

  if v_plan_price is not null then
    return v_plan_price;
  end if;

  return coalesce(v_legacy, v_standard);
end;
$$;

grant execute on function public.resolve_centre_test_price(uuid, uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- OPTIONAL: wire plan prices into book_test() (vita-app / lab_diagnostics.sql)
-- Only run this block if book_test already exists and you want live bookings
-- to use plan-wise prices instead of centre_tests.member_price alone.
-- ---------------------------------------------------------------------------
/*
-- Inside book_test(), replace the fee column in the INSERT with:
case when v_member then coalesce(
  public.resolve_centre_test_price(v_uid, v_slot.centre_id, p_test_id),
  v_offer.price
) else v_offer.price end,
*/