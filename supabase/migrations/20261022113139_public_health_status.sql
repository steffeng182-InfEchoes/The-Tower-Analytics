create table public.tower_health_status (
 id text primary key check (id = 'guild-v1'),
 healthy boolean not null check (healthy)
);
insert into public.tower_health_status(id,healthy) values ('guild-v1',true);
alter table public.tower_health_status enable row level security;
revoke all on public.tower_health_status from public,anon,authenticated;
grant select on public.tower_health_status to anon,authenticated;
create policy health_read_fixed_public_status on public.tower_health_status for select to anon,authenticated using (id='guild-v1');
create function public.tower_public_health() returns jsonb
language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('database',exists(select 1 from public.tower_health_status where id='guild-v1' and healthy),'schema','guild-v1','public',true);
$$;
revoke all on function public.tower_public_health() from public;
grant execute on function public.tower_public_health() to anon,authenticated;
