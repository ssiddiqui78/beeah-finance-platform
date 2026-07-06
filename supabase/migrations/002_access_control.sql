create table if not exists public.app_user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null check (
    role_key in ('owner', 'admin', 'approver', 'preparer', 'viewer')
  ),
  is_active boolean not null default true,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, role_key)
);

create table if not exists public.app_scope_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope_level text not null check (
    scope_level in ('group', 'vertical', 'sub_vertical', 'company', 'profit_center')
  ),
  scope_value text not null,
  is_active boolean not null default true,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_role_assignments_user
  on public.app_role_assignments(user_id);

create index if not exists idx_app_scope_assignments_user
  on public.app_scope_assignments(user_id);

create index if not exists idx_app_scope_assignments_scope
  on public.app_scope_assignments(scope_level, scope_value);
