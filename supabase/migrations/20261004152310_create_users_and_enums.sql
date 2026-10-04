create type public.user_role as enum ('staff', 'parent', 'admin');

create type public.user_status as enum ('pending', 'active');

create type public.relationship_type as enum ('father', 'mother', 'guardian');

create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'cancelled');

create type public.post_type as enum ('meal', 'nap', 'activity', 'achievement', 'photo', 'announcement');

create type public.child_status as enum ('active', 'archived');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  daycare_id uuid not null references public.daycares(id),
  role public.user_role not null,
  status public.user_status not null default 'active',
  full_name text not null,
  avatar_url text,
  notify_on_post boolean not null default true,
  daily_summary_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  daycare_id_value uuid;
  role_value public.user_role;
  full_name_value text;
begin
  if nullif(trim(metadata ->> 'daycare_id'), '') is null then
    raise exception 'User metadata must include a daycare_id';
  end if;

  begin
    daycare_id_value := (metadata ->> 'daycare_id')::uuid;
  exception
    when invalid_text_representation then
      raise exception 'User metadata daycare_id must be a valid UUID';
  end;

  if nullif(trim(metadata ->> 'full_name'), '') is null then
    raise exception 'User metadata must include a full_name';
  end if;
  full_name_value := trim(metadata ->> 'full_name');

  begin
    role_value := (metadata ->> 'role')::public.user_role;
  exception
    when invalid_text_representation then
      raise exception 'User metadata role must be a valid user_role';
  end;

  insert into public.users (id, daycare_id, role, full_name)
  values (new.id, daycare_id_value, role_value, full_name_value);

  return new;
end;
$$;

revoke execute on function public.handle_auth_user_created() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_auth_user_created();

create or replace function public.set_users_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_users_updated_at
  before update on public.users
  for each row
  execute function public.set_users_updated_at();

alter table public.users enable row level security;

revoke all on table public.users from anon, authenticated;

grant select on table public.users to authenticated;
grant update (full_name, avatar_url, notify_on_post, daily_summary_enabled)
  on table public.users to authenticated;

create policy users_select_own
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy users_update_own
  on public.users
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
