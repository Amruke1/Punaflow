create extension if not exists pgcrypto;

create table if not exists public.workers (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid references auth.users(id) on delete cascade,
    profile_type text not null default 'independent',
    first_name text not null default '',
    last_name text not null default '',
    full_name text not null default '',
    email text,
    phone text,
    skill text,
    location text,
    hourly_rate numeric(10, 2),
    logo_url text,
    cover_url text,
    website_title text,
    about text,
    service_description text,
    portfolio_image_1 text,
    portfolio_image_2 text,
    portfolio_image_3 text,
    profile_completed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.workers add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.workers add column if not exists profile_type text not null default 'independent';
alter table public.workers add column if not exists first_name text not null default '';
alter table public.workers add column if not exists last_name text not null default '';
alter table public.workers add column if not exists full_name text not null default '';
alter table public.workers add column if not exists email text;
alter table public.workers add column if not exists phone text;
alter table public.workers add column if not exists skill text;
alter table public.workers add column if not exists location text;
alter table public.workers add column if not exists hourly_rate numeric(10, 2);
alter table public.workers add column if not exists logo_url text;
alter table public.workers add column if not exists cover_url text;
alter table public.workers add column if not exists website_title text;
alter table public.workers add column if not exists about text;
alter table public.workers add column if not exists service_description text;
alter table public.workers add column if not exists portfolio_image_1 text;
alter table public.workers add column if not exists portfolio_image_2 text;
alter table public.workers add column if not exists portfolio_image_3 text;
alter table public.workers add column if not exists profile_completed boolean not null default false;
alter table public.workers add column if not exists created_at timestamptz not null default now();
alter table public.workers add column if not exists updated_at timestamptz not null default now();

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'workers'
          and column_name = 'user_id'
    ) then
        execute 'update public.workers set owner_id = user_id::uuid where owner_id is null and user_id is not null';
    end if;
end $$;

update public.workers
set full_name = trim(concat_ws(' ', nullif(first_name, ''), nullif(last_name, '')))
where coalesce(full_name, '') = '';

alter table public.workers
drop constraint if exists workers_profile_type_check;

alter table public.workers
add constraint workers_profile_type_check
check (profile_type in ('independent', 'business'));

create index if not exists workers_owner_id_idx on public.workers(owner_id);
create index if not exists workers_profile_type_idx on public.workers(profile_type);
create index if not exists workers_created_at_idx on public.workers(created_at desc);

alter table public.workers enable row level security;

drop policy if exists "Workers are publicly readable" on public.workers;
drop policy if exists "Users can create their own workers" on public.workers;
drop policy if exists "Users can update their own workers" on public.workers;
drop policy if exists "Users can delete their own workers" on public.workers;

create policy "Workers are publicly readable"
on public.workers
for select
using (true);

create policy "Users can create their own workers"
on public.workers
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Users can update their own workers"
on public.workers
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Users can delete their own workers"
on public.workers
for delete
to authenticated
using (owner_id = auth.uid());

create or replace function public.set_worker_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_worker_updated_at on public.workers;

create trigger set_worker_updated_at
before update on public.workers
for each row
execute function public.set_worker_updated_at();

create or replace function public.limit_independent_worker()
returns trigger
language plpgsql
as $$
begin
    if new.profile_type = 'independent'
       and exists (
           select 1
           from public.workers
           where owner_id = new.owner_id
             and profile_type = 'independent'
       ) then
        raise exception 'Independent users can only create one profile.';
    end if;

    return new;
end;
$$;

drop trigger if exists limit_independent_worker on public.workers;

create trigger limit_independent_worker
before insert on public.workers
for each row
execute function public.limit_independent_worker();
