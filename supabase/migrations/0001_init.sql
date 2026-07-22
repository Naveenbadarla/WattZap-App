-- WattZap Savings Command Centre — production schema (PostgreSQL / Supabase)
--
-- The demo app ships with an in-memory store that mirrors this schema 1:1
-- (see src/lib/types.ts). Swapping the data layer means implementing the same
-- repository functions in src/lib/db.ts against these tables.
--
-- Multi-tenancy: every row is owned by an organisation (directly or through
-- its site). Row Level Security enforces isolation; WattZap staff access is
-- granted through the wattzap_staff table, never by disabling RLS.

create extension if not exists "uuid-ossp";

-- ---------- enums ----------

create type user_role as enum ('owner','plant_manager','finance','maintenance','wattzap_internal');
create type internal_role as enum ('admin','energy_analyst','solar_engineer','customer_success','finance_reviewer','field_technician','savings_verifier');
create type product_state as enum ('locked','preview','eligible','recommended','trial','onboarding','active','completed','suspended','expired','cancelled');
create type data_readiness as enum ('no_data','bill_data','historical_interval','monthly_manual','live_meter','live_equipment','control_enabled','verification_enabled');
create type data_tag as enum ('historical','uploaded','estimated','simulated','live','verified');
create type site_health as enum ('good','needs_attention','critical');
create type opportunity_status as enum ('new','under_review','info_required','recommended','approved','rejected','planned','in_progress','implemented','measuring','verified','closed');
create type savings_stage as enum ('identified','approved','implemented','measured','verified');
create type alert_category as enum ('critical','action_required','opportunity','information','data_issue','product_recommendation');
create type confidence_level as enum ('high','medium','low');
create type step_status as enum ('done','in_progress','pending');

-- ---------- core tenancy ----------

create table organisations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  gstin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table sites (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organisations(id),
  name text not null,
  short_name text not null,
  industry text not null,
  location text not null,
  state text not null,
  connection_type text not null,
  discom text,
  sanctioned_demand_kva numeric,
  contract_demand_kva numeric,
  connected_load_kw numeric,
  operating_hours text,
  monthly_production numeric,
  production_unit text,
  solar_installed_kw numeric not null default 0,
  roof_area_sqft numeric,
  data_readiness data_readiness not null default 'no_data',
  maturity_level smallint not null default 0 check (maturity_level between 0 and 5),
  health site_health not null default 'good',
  health_reason text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Profiles extend Supabase auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references organisations(id),
  name text not null,
  phone text,
  role user_role not null,
  internal_role internal_role,
  language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table site_memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  site_id uuid not null references sites(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, site_id)
);

create table wattzap_staff (
  user_id uuid primary key references profiles(id) on delete cascade,
  internal_role internal_role not null,
  created_at timestamptz not null default now()
);

-- ---------- products & entitlements ----------

create table products (
  slug text primary key,
  name text not null,
  stage text not null check (stage in ('diagnose','protect','optimise','generate','finance','prove')),
  tagline text not null,
  description text,
  commercial_model text,
  sort_order int not null default 0
);

create table entitlement_rules (
  id uuid primary key default uuid_generate_v4(),
  product_slug text not null references products(slug),
  requires_readiness data_readiness[] not null default '{}',
  requires_products text[] not null default '{}',
  requires_flags text[] not null default '{}',
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table product_entitlements (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  product_slug text not null references products(slug),
  state product_state not null default 'locked',
  state_reason text,
  unlock_steps jsonb not null default '[]',
  estimated_annual_value numeric,
  recommended boolean not null default false,
  activated_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, product_slug)
);

create table product_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  entitlement_id uuid not null references product_entitlements(id),
  plan text not null,
  starts_on date not null,
  ends_on date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table product_milestones (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  product_slug text not null references products(slug),
  step int not null,
  title text not null,
  status step_status not null default 'pending',
  happened_on date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- metering & energy data ----------

create table meters (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  serial_no text not null,
  meter_type text not null,
  status text not null default 'registered',
  created_at timestamptz not null default now()
);

create table meter_channels (
  id uuid primary key default uuid_generate_v4(),
  meter_id uuid not null references meters(id) on delete cascade,
  channel text not null,          -- kwh, kva, pf, kvarh…
  unit text not null
);

create table meter_readings (
  id bigint generated always as identity primary key,
  channel_id uuid not null references meter_channels(id) on delete cascade,
  ts timestamptz not null,
  value numeric not null,
  tag data_tag not null default 'historical'
);
create index on meter_readings (channel_id, ts);

create table edge_devices (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  serial_no text not null unique,
  status text not null default 'ordered',   -- ordered|configured|installed|online|offline
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table device_connectivity_events (
  id bigint generated always as identity primary key,
  device_id uuid not null references edge_devices(id) on delete cascade,
  event text not null,
  ts timestamptz not null default now()
);

create table billing_accounts (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  service_no text not null,
  discom text not null,
  tariff_category text,
  created_at timestamptz not null default now()
);

create table tariffs (
  id uuid primary key default uuid_generate_v4(),
  discom text not null,
  category text not null,
  effective_from date not null,
  components jsonb not null  -- energy/demand/tod/pf-penalty structures
);

create table electricity_bills (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  billing_account_id uuid references billing_accounts(id),
  month text not null,                 -- YYYY-MM
  bill_number text,
  amount numeric not null,
  units_kwh numeric,
  recorded_md_kva numeric,
  billed_md_kva numeric,
  power_factor numeric,
  pf_penalty numeric not null default 0,
  md_penalty numeric not null default 0,
  tod_peak_units numeric,
  tod_normal_units numeric,
  tod_offpeak_units numeric,
  anomalies jsonb not null default '[]',
  status text not null default 'uploaded',
  tag data_tag not null default 'uploaded',
  document_id uuid,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, month)
);

create table demand_records (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  happened_on date not null,
  happened_at time,
  peak_kva numeric not null,
  threshold_kva numeric not null,
  duration_min int,
  likely_cause text,
  estimated_cost numeric,
  tag data_tag not null default 'historical',
  created_at timestamptz not null default now()
);

create table power_factor_records (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  month text not null,
  avg_pf numeric,
  worst_pf numeric,
  worst_window text,
  penalty numeric not null default 0,
  likely_cause text,
  tag data_tag not null default 'historical',
  created_at timestamptz not null default now()
);

create table solar_assets (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  capacity_kw numeric not null,
  commissioned_on date,
  expected_gen_kwh_year numeric,
  status text not null default 'registered',
  created_at timestamptz not null default now()
);

create table equipment_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique
);

create table equipment (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  category_id uuid references equipment_categories(id),
  name text not null,
  rated_kw numeric,
  notes text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- opportunities, actions, savings ----------

create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  title text not null,
  plain_explanation text not null,
  what_happened text,
  why_it_matters text,
  technical_detail text,
  annual_saving numeric not null,
  implementation_cost numeric not null default 0,
  payback_months int,
  confidence confidence_level not null default 'medium',
  complexity confidence_level not null default 'medium',
  priority smallint not null default 2,
  product_slug text references products(slug),
  required_action text,
  decision_owner_role user_role,
  status opportunity_status not null default 'new',
  evidence jsonb not null default '[]',
  identified_on date not null,
  tag data_tag not null default 'estimated',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table opportunity_calculations (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  method text not null,
  inputs jsonb not null,
  result numeric not null,
  created_at timestamptz not null default now()
);

create table actions (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  opportunity_id uuid references opportunities(id),
  title text not null,
  detail text,
  monthly_value numeric,
  difficulty confidence_level not null default 'low',
  assignee_role user_role,
  assignee_id uuid references profiles(id),
  due_date date,
  status text not null default 'open',
  completed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table baselines (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  name text not null,
  period_from date not null,
  period_to date not null,
  model jsonb not null,          -- regression/normalisation parameters
  status text not null default 'draft',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table savings_entries (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  opportunity_id uuid references opportunities(id),
  baseline_id uuid references baselines(id),
  title text not null,
  product_slug text references products(slug),
  stage savings_stage not null default 'identified',
  expected_annual numeric not null,
  verified_annual numeric,
  monthly_expected numeric,
  monthly_verified numeric,
  baseline_note text,
  measurement_period text,
  method text,
  adjustments text,
  variance_reason text,
  confidence confidence_level not null default 'medium',
  evidence jsonb not null default '[]',
  wattzap_reviewer uuid references profiles(id),
  customer_approver uuid references profiles(id),
  status text,
  tag data_tag not null default 'estimated',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table savings_verifications (
  id uuid primary key default uuid_generate_v4(),
  savings_entry_id uuid not null references savings_entries(id) on delete cascade,
  measured_value numeric not null,
  measurement_from date not null,
  measurement_to date not null,
  adjustments jsonb not null default '[]',
  verdict text not null,
  verifier uuid references profiles(id),
  verified_at timestamptz not null default now(),
  evidence jsonb not null default '[]'
);

create table savings_ledger (
  id bigint generated always as identity primary key,
  site_id uuid not null references sites(id),
  savings_entry_id uuid references savings_entries(id),
  entry_type text not null,       -- identified|approved|implemented|measured|verified|adjustment
  amount_annual numeric not null,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- alerts, notifications, comments ----------

create table alerts (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  category alert_category not null,
  title text not null,
  what_happened text not null,
  happened_at timestamptz not null,
  financial_impact numeric,
  why_it_matters text,
  recommended_action text,
  deadline date,
  responsible_role user_role,
  product_slug text references products(slug),
  evidence text,
  tag data_tag not null default 'historical',
  created_at timestamptz not null default now()
);

create table alert_reads (
  alert_id uuid not null references alerts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (alert_id, user_id)
);

create table notification_prefs (
  user_id uuid primary key references profiles(id) on delete cascade,
  in_app boolean not null default true,
  email boolean not null default true,
  whatsapp boolean not null default false,
  sms boolean not null default false,
  updated_at timestamptz not null default now()
);

create table notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  alert_id uuid references alerts(id),
  channel text not null,
  status text not null default 'queued',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table comments (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  entity_type text not null,      -- opportunity|savings_entry|report|document
  entity_id uuid not null,
  author_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- documents, uploads, reports ----------

create table documents (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  category text not null,
  name text not null,
  storage_path text,              -- Supabase Storage object path
  size_kb int,
  file_type text,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table data_uploads (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  document_id uuid references documents(id),
  upload_type text not null,      -- bill|meter_csv|meter_mri|photo|manual
  status text not null default 'received',
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table data_quality_issues (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  upload_id uuid references data_uploads(id),
  description text not null,
  severity text not null default 'warning',
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  report_type text not null,
  title text not null,
  period text,
  version text not null default 'v1.0',
  status text not null default 'draft',
  summary text,
  reviewer uuid references profiles(id),
  approved_by uuid references profiles(id),
  storage_path text,
  tag data_tag not null default 'historical',
  generated_on date not null default current_date,
  created_at timestamptz not null default now()
);

-- ---------- onboarding, support, audit ----------

create table onboarding_steps (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  step int not null,
  title text not null,
  description text,
  status step_status not null default 'pending',
  value_message text,
  updated_at timestamptz not null default now(),
  unique (site_id, step)
);

create table support_requests (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  user_id uuid not null references profiles(id),
  subject text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table customer_approvals (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id),
  entity_type text not null,
  entity_id uuid not null,
  approved_by uuid not null references profiles(id),
  decision text not null,         -- approved|rejected
  comment text,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id bigint generated always as identity primary key,
  org_id uuid references organisations(id),
  site_id uuid references sites(id),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text,
  entity_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------

-- Helper: sites the current user may access.
create or replace function accessible_site_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select s.id from sites s
  where
    -- WattZap staff see all sites
    exists (select 1 from wattzap_staff w where w.user_id = auth.uid())
    -- org owners/finance see all org sites
    or exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.org_id = s.org_id
        and p.role in ('owner','finance')
    )
    -- everyone else needs an explicit site membership
    or exists (
      select 1 from site_memberships m
      where m.user_id = auth.uid() and m.site_id = s.id
    );
$$;

-- Enable RLS everywhere (policies below; write policies are deliberately
-- narrow — most writes go through service-role server actions).
alter table organisations enable row level security;
alter table sites enable row level security;
alter table profiles enable row level security;
alter table site_memberships enable row level security;
alter table product_entitlements enable row level security;
alter table product_milestones enable row level security;
alter table electricity_bills enable row level security;
alter table demand_records enable row level security;
alter table power_factor_records enable row level security;
alter table opportunities enable row level security;
alter table actions enable row level security;
alter table savings_entries enable row level security;
alter table savings_verifications enable row level security;
alter table savings_ledger enable row level security;
alter table alerts enable row level security;
alter table alert_reads enable row level security;
alter table documents enable row level security;
alter table reports enable row level security;
alter table onboarding_steps enable row level security;
alter table support_requests enable row level security;
alter table comments enable row level security;
alter table audit_logs enable row level security;

create policy org_read on organisations for select using (
  id in (select org_id from profiles where id = auth.uid())
  or exists (select 1 from wattzap_staff w where w.user_id = auth.uid())
);

create policy sites_read on sites for select using (id in (select accessible_site_ids()));
create policy profiles_self on profiles for select using (
  id = auth.uid()
  or org_id in (select org_id from profiles where id = auth.uid())
  or exists (select 1 from wattzap_staff w where w.user_id = auth.uid())
);

-- Site-scoped read policies (same shape for every site-owned table):
create policy ent_read  on product_entitlements for select using (site_id in (select accessible_site_ids()));
create policy mil_read  on product_milestones   for select using (site_id in (select accessible_site_ids()));
create policy bill_read on electricity_bills    for select using (site_id in (select accessible_site_ids()));
create policy dr_read   on demand_records       for select using (site_id in (select accessible_site_ids()));
create policy pf_read   on power_factor_records for select using (site_id in (select accessible_site_ids()));
create policy opp_read  on opportunities        for select using (site_id in (select accessible_site_ids()));
create policy act_read  on actions              for select using (site_id in (select accessible_site_ids()));
create policy sav_read  on savings_entries      for select using (site_id in (select accessible_site_ids()));
create policy sl_read   on savings_ledger       for select using (site_id in (select accessible_site_ids()));
create policy al_read   on alerts               for select using (site_id in (select accessible_site_ids()));
create policy doc_read  on documents            for select using (site_id in (select accessible_site_ids()));
create policy rep_read  on reports              for select using (site_id in (select accessible_site_ids()));
create policy ob_read   on onboarding_steps     for select using (site_id in (select accessible_site_ids()));
create policy sr_read   on support_requests     for select using (site_id in (select accessible_site_ids()));
create policy cm_read   on comments             for select using (site_id in (select accessible_site_ids()));

-- Customer-writable tables (still tenant-scoped):
create policy sr_insert on support_requests for insert
  with check (site_id in (select accessible_site_ids()) and user_id = auth.uid());
create policy cm_insert on comments for insert
  with check (site_id in (select accessible_site_ids()) and author_id = auth.uid());
create policy ar_upsert on alert_reads for insert
  with check (user_id = auth.uid());
create policy doc_insert on documents for insert
  with check (site_id in (select accessible_site_ids()) and uploaded_by = auth.uid());

-- Approvals/rejections, entitlement transitions, savings verification and
-- audit-log writes are performed by the application server (service role)
-- after role checks — see src/lib/actions.ts for the authorisation logic.

-- ---------- seed: product catalog ----------

insert into products (slug, name, stage, tagline, sort_order) values
  ('energyscan-lite','EnergyScan Lite','diagnose','A quick first check of your electricity costs.',1),
  ('energyscan-pro','EnergyScan Pro','diagnose','A detailed diagnosis of exactly where money is lost.',2),
  ('pf-guard','PF Guard','protect','Stops power-factor penalties on your bill.',3),
  ('demand-guard','Demand Guard','protect','Prevents costly demand spikes.',4),
  ('bill-guard','Bill Guard','protect','Checks every bill for errors and hidden charges.',5),
  ('solar-guard','Solar Guard','protect','Makes sure your solar delivers what it promised.',6),
  ('ems-lite','EMS Lite','optimise','Live monitoring of your site, in plain language.',7),
  ('wattzap-edge','WattZap Edge','optimise','The onsite device that connects your site to WattZap.',8),
  ('solarfit','SolarFit','generate','The right-sized solar system for your actual load.',9),
  ('solarlease','SolarLease','finance','Solar savings without heavy upfront investment.',10),
  ('savings-assurance','Savings Assurance','prove','Independent proof that your savings are real.',11);
