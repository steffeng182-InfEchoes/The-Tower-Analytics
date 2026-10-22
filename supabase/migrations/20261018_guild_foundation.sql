-- Guild Edition foundation: execute in a NEW, separate Supabase project.
-- No service_role token belongs in the public web application.
create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Tower Player' check (char_length(display_name) between 1 and 60),
  preferred_language text not null default 'en' check (preferred_language in ('de','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.player_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_run_id text not null check (char_length(client_run_id) between 1 and 160),
  source_hash text,
  run_data jsonb not null check (jsonb_typeof(run_data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,client_run_id)
);
create unique index if not exists player_runs_owner_hash_unique
on public.player_runs(user_id,source_hash) where source_hash is not null;
create index if not exists player_runs_owner_created_idx on public.player_runs(user_id,created_at desc);

alter table public.player_profiles enable row level security;
alter table public.player_runs enable row level security;
revoke all on public.player_profiles from anon;
revoke all on public.player_runs from anon;
grant select,insert,update,delete on public.player_profiles to authenticated;
grant select,insert,update,delete on public.player_runs to authenticated;

create policy "profile_select_own" on public.player_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profile_insert_own" on public.player_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profile_update_own" on public.player_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "profile_delete_own" on public.player_profiles for delete to authenticated using ((select auth.uid()) = user_id);
create policy "runs_select_own" on public.player_runs for select to authenticated using ((select auth.uid()) = user_id);
create policy "runs_insert_own" on public.player_runs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "runs_update_own" on public.player_runs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "runs_delete_own" on public.player_runs for delete to authenticated using ((select auth.uid()) = user_id);
-- Cloud migration must be opt-in, idempotent and preceded by a local JSON backup.
-- RLS must be integration-tested with TWO separate authenticated users before launch.


-- WORK 05: unapplied foundation extended for optimistic concurrency and soft deletion.
alter table public.player_runs add column if not exists revision bigint not null default 1;
alter table public.player_runs add column if not exists deleted boolean not null default false;
alter table public.player_profiles add column if not exists settings jsonb not null default '{}'::jsonb
  check (jsonb_typeof(settings) = 'object');
create table public.player_documents (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null check (char_length(client_id) between 1 and 300),
  kind text not null check (kind in ('profiles','accountEntries','settings')),
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  revision bigint not null default 1,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(user_id,client_id)
);
alter table public.player_documents enable row level security;
revoke all on public.player_documents from public,anon;
grant select,insert,update,delete on public.player_documents to authenticated;
create policy documents_select_own on public.player_documents for select to authenticated using ((select auth.uid()) = user_id);
create policy documents_insert_own on public.player_documents for insert to authenticated with check ((select auth.uid()) = user_id);
create policy documents_update_own on public.player_documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy documents_delete_own on public.player_documents for delete to authenticated using ((select auth.uid()) = user_id);

-- Invoker trigger: cannot elevate privileges, revision is always assigned by the database.
create function public.tower_revision() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then new.revision := 1;
  else new.revision := old.revision + 1; end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.tower_revision() from public,anon,authenticated;
create trigger player_runs_revision before insert or update on public.player_runs for each row execute function public.tower_revision();
create trigger player_documents_revision before insert or update on public.player_documents for each row execute function public.tower_revision();

-- A database read under the caller's RLS policies. No private row contents are returned.
create function public.tower_health() returns jsonb language sql stable security invoker set search_path = '' as $$
 select jsonb_build_object('database',true,'schema','guild-v1','own_rows',
   (select count(*) from (select 1 from public.player_runs where user_id = (select auth.uid()) limit 1) as own_rows));
$$;
revoke all on function public.tower_health() from public,anon;
grant execute on function public.tower_health() to authenticated;
