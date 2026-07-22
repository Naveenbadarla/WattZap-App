-- Additions required by the application's Supabase adapter (src/lib/repo/supabase.ts)
-- and the demo-data seeder (scripts/seed-supabase.mjs).

-- Profiles carry a copy of the auth email so the app can render it without
-- touching the auth schema (kept in sync by the seeder / signup trigger).
alter table profiles add column if not exists email text;

-- Display names captured at write time (the referenced profile may be a
-- WattZap staff member whose profile the customer cannot read under RLS).
alter table actions add column if not exists assignee_name text;
alter table savings_entries add column if not exists wattzap_reviewer_name text;
alter table savings_entries add column if not exists customer_approver_name text;
alter table reports add column if not exists reviewer_name text;
alter table reports add column if not exists approved_by_name text;
alter table documents add column if not exists uploaded_by_name text;

-- Plain-language activity trail shown on each opportunity's decision card.
create table if not exists opportunity_activity (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  happened_on date not null default current_date,
  actor text not null,
  event text not null,
  comment text,
  created_at timestamptz not null default now()
);
create index if not exists opportunity_activity_opp_idx on opportunity_activity (opportunity_id, happened_on);

-- Typical-day load profile (from uploaded MRI files) used by EnergyScan Pro.
create table if not exists tod_profile_points (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  hour text not null,           -- "06:00"
  kva numeric not null,
  kwh numeric not null,
  tag data_tag not null default 'historical',
  unique (site_id, hour)
);

alter table opportunity_activity enable row level security;
alter table tod_profile_points enable row level security;

create policy oa_read on opportunity_activity for select using (
  opportunity_id in (
    select id from opportunities where site_id in (select accessible_site_ids())
  )
);
create policy oa_insert on opportunity_activity for insert with check (
  opportunity_id in (
    select id from opportunities where site_id in (select accessible_site_ids())
  )
);
create policy tod_read on tod_profile_points for select using (
  site_id in (select accessible_site_ids())
);
