create extension if not exists pgcrypto;

create table if not exists public.report_periods (
  id uuid primary key default gen_random_uuid(),
  period_code text not null unique,
  period_label text not null,
  fiscal_year integer not null,
  fiscal_month integer,
  quarter_label text,
  status text not null default 'draft',
  source_type text not null default 'excel',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reporting_rows (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.report_periods(id) on delete cascade,
  source_type text not null default 'excel',
  source_batch_id text,
  statement_type text not null,
  scenario text not null default 'actual',
  version_label text,
  co_code text,
  co_name text,
  gl_code text,
  gl_name text,
  ey_mapping_1 text,
  ey_mapping_2 text,
  notes text,
  type text,
  pc_code text,
  pc_name text,
  vertical text,
  sub_vertical text,
  geographical text,
  org_level_3 text,
  jan_value numeric(18,2) default 0,
  feb_value numeric(18,2) default 0,
  mar_value numeric(18,2) default 0,
  apr_value numeric(18,2) default 0,
  may_value numeric(18,2) default 0,
  jun_value numeric(18,2) default 0,
  jul_value numeric(18,2) default 0,
  aug_value numeric(18,2) default 0,
  sep_value numeric(18,2) default 0,
  oct_value numeric(18,2) default 0,
  nov_value numeric(18,2) default 0,
  dec_value numeric(18,2) default 0,
  q1_actuals numeric(18,2) default 0,
  q1_budget numeric(18,2) default 0,
  q2_budget numeric(18,2) default 0,
  q3_budget numeric(18,2) default 0,
  q4_budget numeric(18,2) default 0,
  ytd_budget numeric(18,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.summary_controls (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.report_periods(id) on delete cascade,
  control_section text not null,
  control_line text not null,
  budget_value numeric(18,2) default 0,
  actual_value numeric(18,2) default 0,
  variance_value numeric(18,2) default 0,
  variance_pct numeric(18,4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commentary (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.report_periods(id) on delete cascade,
  module_key text not null,
  entity_level text not null,
  entity_key text not null,
  status text not null default 'draft',
  owner_name text,
  comment_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.import_logs (
  id uuid primary key default gen_random_uuid(),
  period_id uuid references public.report_periods(id) on delete set null,
  source_type text not null,
  source_reference text,
  import_status text not null default 'received',
  records_loaded integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text
);

create table if not exists public.planning_versions (
  id uuid primary key default gen_random_uuid(),
  version_code text not null unique,
  version_label text not null,
  scenario_type text not null,
  fiscal_year integer not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reporting_rows_period on public.reporting_rows(period_id);
create index if not exists idx_reporting_rows_statement on public.reporting_rows(statement_type);
create index if not exists idx_reporting_rows_vertical on public.reporting_rows(vertical, sub_vertical);
create index if not exists idx_reporting_rows_company on public.reporting_rows(co_name, pc_name);
create index if not exists idx_commentary_module on public.commentary(module_key, entity_level, entity_key);
