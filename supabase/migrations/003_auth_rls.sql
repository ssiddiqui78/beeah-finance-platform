-- 1. Create Core Reporting Tables if they are missing from previous steps
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
  source_type text not null,
  source_batch_id text,
  statement_type text not null,
  scenario text not null,
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
  jan_value numeric not null default 0,
  feb_value numeric not null default 0,
  mar_value numeric not null default 0,
  apr_value numeric not null default 0,
  may_value numeric not null default 0,
  jun_value numeric not null default 0,
  jul_value numeric not null default 0,
  aug_value numeric not null default 0,
  sep_value numeric not null default 0,
  oct_value numeric not null default 0,
  nov_value numeric not null default 0,
  dec_value numeric not null default 0,
  q1_actuals numeric not null default 0,
  q1_budget numeric not null default 0,
  q2_budget numeric not null default 0,
  q3_budget numeric not null default 0,
  q4_budget numeric not null default 0,
  ytd_budget numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.summary_controls (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.report_periods(id) on delete cascade,
  control_section text not null,
  control_line text not null,
  budget_value numeric not null default 0,
  actual_value numeric not null default 0,
  variance_value numeric not null default 0,
  variance_pct numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.commentary (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.import_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.planning_versions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- 2. Construct The Central RBAC Guard Database Function
create or replace function public.has_platform_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_role_assignments
    where user_id = auth.uid()
      and role_key = any(allowed_roles)
  );
$$;

grant execute on function public.has_platform_role(text[]) to authenticated;

-- 3. Globally Activate Row Level Security Protection Over All Tables
alter table public.app_user_profiles enable row level security;
alter table public.app_role_assignments enable row level security;
alter table public.app_scope_assignments enable row level security;
alter table public.report_periods enable row level security;
alter table public.reporting_rows enable row level security;
alter table public.summary_controls enable row level security;
alter table public.commentary enable row level security;
alter table public.import_logs enable row level security;
alter table public.planning_versions enable row level security;

-- 4. Establish Granular Read/Write Data Security Policies
create policy "users can read own profile"
on public.app_user_profiles for select to authenticated
using (user_id = auth.uid());

create policy "users can read own roles"
on public.app_role_assignments for select to authenticated
using (user_id = auth.uid());

create policy "users can read own scope assignments"
on public.app_scope_assignments for select to authenticated
using (user_id = auth.uid());

create policy "authenticated can read periods"
on public.report_periods for select to authenticated
using (true);

create policy "authenticated can read reporting rows"
on public.reporting_rows for select to authenticated
using (true);

create policy "authenticated can read summary controls"
on public.summary_controls for select to authenticated
using (true);

create policy "authenticated can read commentary"
on public.commentary for select to authenticated
using (true);

create policy "owner admin can manage commentary"
on public.commentary for all to authenticated
using (public.has_platform_role(array['owner','admin','approver','preparer']))
with check (public.has_platform_role(array['owner','admin','approver','preparer']));

create policy "owner admin can manage import logs"
on public.import_logs for all to authenticated
using (public.has_platform_role(array['owner','admin']))
with check (public.has_platform_role(array['owner','admin']));

create policy "owner admin can manage planning versions"
on public.planning_versions for all to authenticated
using (public.has_platform_role(array['owner','admin']))
with check (public.has_platform_role(array['owner','admin']));
